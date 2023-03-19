import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { MessageWsModule } from './message-ws/message-ws.module';

@Module(
  {
  imports: [
    ServeStaticModule.forRoot({
      // los puntos es parte del path y lo une a la carpeta public, easy
      rootPath: join(__dirname, '..', 'public'),
    }),
    
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [],
      // synchronize en production es false
      synchronize: true,
      // no tenemos que agregar las entities al array.
      autoLoadEntities: true,

    }),
    ProductsModule,
    
    CommonModule,
    
    SeedModule,
    
    FilesModule,
    
    AuthModule,
    
    MessageWsModule,
]
})
export class AppModule {}
