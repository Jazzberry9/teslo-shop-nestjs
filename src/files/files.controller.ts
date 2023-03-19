// import { join } from 'path';
// import { createReadStream } from 'fs';
import { diskStorage } from 'multer';

import { Controller, Get, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, StreamableFile, Header, Param, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileNamer } from './helpers';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
// este helper es otra manera de hacerlo pero no lo usamos por ParseFilePie
// import { fileFilter } from './helpers/fileFilter.helper';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService:ConfigService
    ) {}

  @Get('product/:imageName')
  @Header('Content-Type', 'image/jpeg')
  getFile(@Param('imageName') imageName: string) {
    const file = this.filesService.findOneById(imageName)

    return new StreamableFile(file);
  }
  // findProduct(@Param('imageName') imageName: string){
  //   return this.filesService.findOneById(imageName)
  // }
  
  @Post('product')
  @Header('content-type', 'application/json')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
      })
    })
  )
  uploadProductImage(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 2097152}),
        new FileTypeValidator({ fileType: 'image/jpeg' }),
      ],
    }),
  ) file: Express.Multer.File){
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {
      secureUrl
    }
  }
}


// @UseInterceptors(FileInterceptor('file', {
//   fileFilter: fileFilter
// }))
// uploadProductImage(@UploadedFile() file: Express.Multer.File){
    
//     if( !file ){
//       throw new BadRequestException(`Make sure you are uploading an image`)
//     }

//     return {
//       file: file.originalname
//     }
// }