import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
