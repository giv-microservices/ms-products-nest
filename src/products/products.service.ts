import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    //TODO improve using try catch instead of find one
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.product.update({ where: { id }, data: updateProductDto });
  }

  async remove(id: number) {
    const product = await this.product.findFirst({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.product.update({ where: { id }, data: { available: false } });
  }
}
