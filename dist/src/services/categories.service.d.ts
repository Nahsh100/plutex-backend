import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        sortOrder: number;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        sortOrder: number;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        slug: string;
        image: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
