import { AppDataSource } from '../config/database';
import { Part, PartComponent, PartType } from '../models/Part';
import { In, QueryRunner } from 'typeorm';
import { CreatePartData, InventoryResponse, PartWithComponents } from '../interfaces/part.interface';
import { 
  PartNotFoundError, 
  CircularDependencyError,
  DatabaseError,
  DuplicatePartNameError,
} from '../errors/part.errors';

export class PartService {
  private partRepository = AppDataSource.getRepository(Part);
  private partComponentRepository = AppDataSource.getRepository(PartComponent);

  private async handleAssemblyParts(
    queryRunner: QueryRunner,
    part: Part,
    components: { id: string; quantity: number }[],
    componentParts: Part[]
  ) {
    // Create a map for quick component lookup
    const componentMap = new Map(componentParts.map(p => [p.id, p]));

    // Check for circular dependencies in bulk
    const hasCircular = await Promise.all(
      components.map(c => this.hasCircularDependency(part.id, c.id))
    );

    if (hasCircular.some(result => result)) {
      throw new CircularDependencyError();
    }

    // Bulk create all component relationships
    const partComponents = components.map(componentData => {
      const componentPart = componentMap.get(componentData.id);
      return this.partComponentRepository.create({
        assembledPart: part,
        componentPart: componentPart,
        quantity: componentData.quantity,
      });
    });

    await queryRunner.manager.save(partComponents);
  }

  private async hasCircularDependency(
    assembledPartId: string,
    componentPartId: string,
    visited: Set<string> = new Set()
  ): Promise<boolean> {
    if (assembledPartId === componentPartId) return true;
    if (visited.has(componentPartId)) return false;

    visited.add(componentPartId);

    const components = await this.partComponentRepository.find({
      where: { assembledPartId: componentPartId }
    });

    for (const component of components) {
      if (await this.hasCircularDependency(assembledPartId, component.componentPartId, visited)) {
        return true;
      }
    }

    return false;
  }

  async createPart(data: CreatePartData): Promise<Part> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      // First connect and start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if part with same name exists
      const existingPart = await queryRunner.manager
        .getRepository(Part)
        .findOne({
          where: { name: data.name }
        });

      if (existingPart) {
        await queryRunner.rollbackTransaction();
        throw new DuplicatePartNameError(data.name);
      }

      const part = this.partRepository.create({
        name: data.name,
        type: data.type,
        description: data.description,
        quantityInStock: 0,
      });

      await queryRunner.manager.save(part);

      if (data.type === PartType.ASSEMBLED && data.parts?.length) {
        // Bulk fetch all component parts
        const componentIds = data.parts.map(p => p.id);
        const componentParts = await queryRunner.manager
          .getRepository(Part)
          .find({
            where: { id: In(componentIds) }
          });

        // Find which component IDs are missing
        const foundIds = new Set(componentParts.map(p => p.id));
        const missingIds = componentIds.filter(id => !foundIds.has(id));

        if (missingIds.length > 0) {
          await queryRunner.rollbackTransaction();
          throw new PartNotFoundError(
            `Component parts not found with IDs: ${missingIds.join(', ')}`
          );
        }

        await this.handleAssemblyParts(queryRunner, part, data.parts, componentParts);
      }

      await queryRunner.commitTransaction();
      return part;

    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addPart(partId: string, quantity: number): Promise<InventoryResponse> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Get part with its components
      const part = await queryRunner.manager
        .getRepository(Part)
        .findOne({
          where: { id: partId },
          lock: { mode: 'pessimistic_write' }
        });

      if (!part) {
        return { 
          status: 'FAILED' as const, 
          message: `Part not found` 
        };
      }

      // Check if we have enough quantity when removing
      if (quantity < 0 && Math.abs(quantity) > part.quantityInStock) {
        return {
          status: 'FAILED' as const,
          message: `Insufficient quantity for ${part.name}`
        };
      }

      if (part.type === PartType.ASSEMBLED && quantity > 0) {
        // Load components with their parts
        const components = await queryRunner.manager
          .getRepository(PartComponent)
          .find({
            where: { assembledPartId: part.id },
            relations: ['componentPart']
          });

        // Check component quantities
        for (const component of components) {
          const required = component.quantity * quantity;
          if (component.componentPart.quantityInStock < required) {
            return {
              status: 'FAILED' as const,
              message: `Insufficient quantity of ${component.componentPart.name}`
            };
          }
        }

        // Update component quantities
        for (const component of components) {
          component.componentPart.quantityInStock -= component.quantity * quantity;
          await queryRunner.manager.save(Part, component.componentPart);
        }
      }

      // Update main part quantity
      part.quantityInStock += quantity;
      await queryRunner.manager.save(Part, part);
      await queryRunner.commitTransaction();

      return { 
        status: 'SUCCESS' as const,
        message: `Updated quantity for ${part.name}`
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { 
        status: 'FAILED' as const, 
        message: error instanceof Error ? error.message : 'Update failed'
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getPart(id: string): Promise<PartWithComponents | null> {
    try {
      const part = await this.partRepository.findOne({
        where: { id }
      });

      if (!part) {
        return null;
      }

      // If it's an assembled part, fetch its components
      if (part.type === PartType.ASSEMBLED) {
        const components = await this.partComponentRepository.find({
          where: { assembledPartId: part.id },
          relations: ['componentPart']
        });

        // Add components to the response
        return {
          ...part,
          parts: components.map(comp => ({
            id: comp.componentPart.id,
            name: comp.componentPart.name,
            quantity: comp.quantity
          }))
        };
      }

      return {
        ...part
      };
    } catch (error) {
      throw new DatabaseError('Error fetching part');
    }
  }

  async listParts(): Promise<PartWithComponents[]> {
    try {
      // Get all parts first
      const parts = await this.partRepository.find({
        order: { name: 'ASC' }
      });

      // Get all assembled parts' IDs
      const assembledPartIds = parts
        .filter(part => part.type === PartType.ASSEMBLED)
        .map(part => part.id);

      // If there are assembled parts, fetch their components
      if (assembledPartIds.length > 0) {
        const components = await this.partComponentRepository.find({
          where: { assembledPartId: In(assembledPartIds) },
          relations: ['componentPart']
        });

        // Group components by assembled part ID
        const componentMap = new Map<string, typeof components>();
        components.forEach(comp => {
          const comps = componentMap.get(comp.assembledPartId) || [];
          comps.push(comp);
          componentMap.set(comp.assembledPartId, comps);
        });

        // Map parts to include components where applicable
        return parts.map(part => {
          if (part.type === PartType.ASSEMBLED) {
            const partComponents = componentMap.get(part.id) || [];
            return {
              ...part,
              parts: partComponents.map(comp => ({
                id: comp.componentPart.id,
                name: comp.componentPart.name,
                quantity: comp.quantity
              }))
            };
          }
          return {
            ...part
          };
        });
      }

      // If no assembled parts, return parts with empty components arrays
      return parts.map(part => ({
        ...part
      }));
    } catch (error) {
      throw new DatabaseError('Error fetching parts list');
    }
  }


} 