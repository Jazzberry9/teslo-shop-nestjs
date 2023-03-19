import { IsArray, IsString } from "class-validator";
import { Product } from "../../products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;
    
    @Column('text', {
        select: false
    })
    password: string;
    
    @Column('text', {
        nullable: true
    })
    fullName: string;
    
    @Column('bool', {
        default: true
    })
    isActive: boolean;
    
    @Column('text', {
        array: true,
        default: ['regular']
    })
    roles: string[];

    @OneToMany(
        ( () => Product),
        ( (product) => product.user),
    )
    product: Product;
    
    @BeforeInsert()
    validFieldsInsert(){
        this.email = this.email.toLowerCase().trim()
    }

    @BeforeUpdate()
    validFieldsUpdate(){
        this.validFieldsInsert()
    }
}
