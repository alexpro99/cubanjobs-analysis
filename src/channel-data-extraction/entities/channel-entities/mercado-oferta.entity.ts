import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoOperacion {
  COMPRA = 'COMPRA',
  VENTA = 'VENTA',
}

@Entity()
export class MercadoOferta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() // Indexamos el tipo de operación para que las búsquedas (ej: "todas las compras") sean rápidas.
  @Column({
    type: 'enum',
    enum: TipoOperacion,
    nullable: false, // Este campo es obligatorio.
  })
  tipo_operacion: TipoOperacion;

  @Index() // Indexamos las monedas para búsquedas rápidas por par (ej: USDT/CUP).
  @Column({ type: 'varchar', length: 20, nullable: false })
  moneda_origen: string;

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: false })
  moneda_destino: string;

  // Usamos el tipo 'decimal' para la tasa de cambio para evitar errores de precisión con números flotantes.
  // Es la mejor práctica para datos financieros.
  // precision: el número total de dígitos.
  // scale: el número de dígitos después del punto decimal.
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  tasa_cambio: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto_minimo: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto_maximo: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  volumen_asociado_tasa: number | null;

  // Usamos 'text' para condiciones adicionales ya que la longitud puede ser variable.
  @Column({ type: 'text', nullable: true })
  texto_adicional: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fuente_contacto: string | null;

  @Column({ nullable: true })
  oferta_id: number;

  @Column({ nullable: true })
  extractedWith: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
