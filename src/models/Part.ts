import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum PartType {
  RAW = 'RAW',
  ASSEMBLED = 'ASSEMBLED',
}

@Entity('parts')
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: PartType,
  })
  type: PartType;

  @Column({ default: 0 })
  quantityInStock: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('part_components')
export class PartComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assembledPartId: string;

  @Column()
  componentPartId: string;

  @Column()
  quantity: number;

  @ManyToOne(() => Part)
  @JoinColumn({ name: 'assembledPartId' })
  assembledPart: Part;

  @ManyToOne(() => Part)
  @JoinColumn({ name: 'componentPartId' })
  componentPart: Part;
} 