// esto es una representacion de Product en la base de datos, eso es una entity
// esto seria una tabla.
// Es como el Modelo en el MVC

import { User } from "../../auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-img.entity";
import { ApiProperty } from "@nestjs/swagger";

// el decorador es para que literal diga que es un entity
@Entity({
    name: 'products'
})
export class Product {

    @ApiProperty({
        example: '0ae92503-1512-49b5-9927-29d4a31aa6c7',
        description: '0ae92503-1512-49b5-9927-29d4a31aa6c7',
        uniqueItems: true
    })
    // normalmente es number pero como pusimos uuid, es string.
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shit Testlo',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'lorem ipsum metzen hatsen strudden',
        description: 'Product description',
        default: null
    })
    // Otra manera de hacer lo anterior
    @Column({
        type: 'text',
        nullable: true,
    })
    descripcion: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product slug - for SEO',
        default: null
    })
    @Column({
        type: "text",
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['XL', 'M', 'SM', 'S'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['yellow','forMen', 'winter', 'clothing'],
        description: 'Product tags',
        isArray: true,
        default: []
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];
    
    @ApiProperty({
        example: ['img/url.com', 'img/url.com2', 'img/url.com3'],
        description: 'Product images',
        isArray: true,
        default: []
    })
    @OneToMany(
        ( ()=> ProductImage),
        ( ( ProductImage )=> ProductImage.product),
        { cascade: true, eager: true}
    )
    images?: ProductImage[];

    @ManyToOne(
        ( () => User),
        ( (user) => user.product),
        { eager: true } // carga auto y lo muestra
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert(){
        
        if( !this.slug ){
            this.slug = this.title
        }
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", "")
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", "")
    }
} 

