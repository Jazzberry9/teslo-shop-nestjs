import { validate as IsUUID } from 'uuid'
import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { Logger } from '@nestjs/common/services';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/DTOs/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductImage, Product } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger()

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    
    @InjectRepository(ProductImage)
    private readonly productsImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ){}


  async create(createProductDto: CreateProductDto, user: User) {
   
    try {
      const { images = [], ...restOf } = createProductDto;

      const product = this.productsRepository.create({
        ...restOf,
        images: images.map( image => this.productsImagesRepository.create({ url: image})),
        user
      })
      await this.productsRepository.save( product )
  
      return {...product, images};
    } catch (error) {
      this.handleBDExceptions(error)
    }
  }

  async findAll( paginationDto: PaginationDto) {

    const { limit = 5, offset = 0 } = paginationDto;
    
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    })
    // Lo siguiente es para aplanar las imagenes ( sin id, ni url... solo img)
    // Solo se podria hacer el return products y ya...
    return products.map( products => ({
      ...products,
      images: products.images.map( img => img.url)
    }))
  }

  async findOne(term: string) {
    
    let product: Product;
    
    if ( IsUUID( term )){
      product = await this.productsRepository.findOneBy({ id: term})
    } else {
      product = await this.productsRepository.createQueryBuilder('prod')
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImg')
        .getOne()
    }

    if( !product ){
      throw new NotFoundException('Product not found')
    }

    return product;
  }

  async findOnePlain( term: string){
    const { images = [], ...rest} = await this.findOne(term);

    return {
      ...rest,
      images: images.map( img => img.url)

    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    // precarga el objeto que encuentra por el id
    // y con el spread operator le esparcimos lo que venga del update ( body )
    const product = await this.productsRepository.preload({ id,...toUpdate })

    if( !product ) throw new NotFoundException(`The product with the id ${id} wasn't found`)

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Si vienen imagenes, borramos las que teniamos ( decision del lider )
      if( images ){ // toma una entidad el delete y un criterio
        await queryRunner.manager.delete( ProductImage, { product : { id } } )
      
        product.images = images.map( 
            img => this.productsImagesRepository.create({ url: img})
          )
      } 
      // con el await de abajo se guardaba antes de la imagen
      // await this.productsRepository.save( product )   
      product.user = user;
      await queryRunner.manager.save( product )
      // Si no hay error hasta este punto, aplica los cambios
      await queryRunner.commitTransaction();

      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {
      
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      
      // handle unique error in db
      this.handleBDExceptions(error);      
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id )

    await this.productsRepository.remove( product )
  }

  async deleteAllProducts(){
    const query = this.productsRepository.createQueryBuilder('products');

    try {
      
      return await query.delete().where({}).execute()

    } catch (error) {
      this.handleBDExceptions(error)
    }
  }

  private handleBDExceptions( error: any ){
    if( error.code === '23505')
        throw new BadRequestException(error.detail)
      
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }
}
