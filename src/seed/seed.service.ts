import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt'


@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ){}

  async generateSeed(){

    await this.deleteTable()

    const firstUser = await this.inserUsers()
    
    await this.insertNewProducts( firstUser )

    return `Seeds executed`
  }
  // para eliminar las tablas creadas en cascada
  private async deleteTable(){

    await this.productService.deleteAllProducts();

    const query = this.userRepository.createQueryBuilder();

    await query
      .delete()
      .where({}) // esto elimina todo
      .execute()

  }

  private async inserUsers(){
    
    const seedUsers = initialData.users;
    
    const users: User[] = [];

    seedUsers.forEach((user) => {

      const password = user.password;
      user.password = bcrypt.hashSync(password, 10)

      users.push(this.userRepository.create(user));
    });
    
    await this.userRepository.save( users );

    return users[0]   
  }

  private async insertNewProducts( user: User ){
    
    await this.productService.deleteAllProducts();

    const products = initialData.products;
    
    const insertPromises = [];
    
    products.forEach( product => {
      insertPromises.push( this.productService.create(product, user) )
    })

    await Promise.all( insertPromises )

    return true;
  }
}

