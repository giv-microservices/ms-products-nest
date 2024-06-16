import {
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database ✅');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.product.create({ data: createProductDto });
  }

  async findAll(_paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = _paginationDto;
    const total = await this.product.count({ where: { available: true } });
    const products = await this.product.findMany({
      skip: (page - 1) * limit, // pages start from 0
      take: limit,
      where: { available: true },
    });

    return {
      meta: {
        isFirst: page === 1,
        isLast: page * limit >= total,
        page,
        limit,
        total,
        last: Math.ceil(total / limit),
      },
      data: products,
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }
    return product;
  }



  async update(id: number, updateProductDto: UpdateProductDto) {
    // _ to ignore id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: __, ...data } = updateProductDto;

    const product = await this.findOne(id);
    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }
    return this.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    const product = await this.product.findFirst({ where: { id } });
    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }
    const productDeleted = await this.product.delete({
      where: { id: product.id },
    });

    return {
      message: 'Product deleted successfully',
      product_id: productDeleted.id,
    };
  }
  async softDelete(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }
    return this.product.update({ where: { id }, data: { available: false } });
  }

  async validateProducts(productsIds: number[]) {
    // Remove duplicates
    const ids =  Array.from(new Set(productsIds));
    try {
      const products = await this.product.findMany({ where: { id: { in: ids } } });

      if (products.length !== ids.length) {
        throw new RpcException({
          message: 'Some products were not found',
          status: HttpStatus.BAD_REQUEST
        });
      }
      return products;
    }
    catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST
      });
    }

  }
}
