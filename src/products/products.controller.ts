import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/DTOs/pagination.dto';

import { ValidRolesInterface } from 'src/auth/interfaces';
import { getUser, Auth } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  // existen varias API responses disponibles por nest/swagger
  @ApiResponse({ status: 201, description: 'Product was created', type: Product})
  @ApiBadRequestResponse({description: 'Bad Requested'})
  @ApiResponse({ status: 403, description: 'Forbidden. Token Related'})
  create(
    @Body() createProductDto: CreateProductDto,
    @getUser() user: User
    ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll( @Query() paginationDto: PaginationDto) {
    // console.log(paginationDto);
    return this.productsService.findAll( paginationDto );
  }

  @Get(':term')
  findOnePlain(@Param('term' ) term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @Auth( ValidRolesInterface.admin)
  update(
    @Param('id', ParseUUIDPipe ) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @getUser() user: User
  ) {
    return this.productsService.update( id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth( ValidRolesInterface.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
