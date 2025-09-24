import { CreateOrderDto } from './create-order.dto';
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateOrderDto, "items">>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    items?: CreateOrderDto['items'];
}
export {};
