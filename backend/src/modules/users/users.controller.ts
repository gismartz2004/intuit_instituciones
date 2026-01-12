import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { InsertUsuario, insertUsuarioSchema } from 'src/shared/schema';

@Controller('usuarios')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.getUser(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    @Get()
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    // Admin only creation endpoint
    @Post()
    async createUser(@Body() body: any) {
        // Validation could go here or in a Pipe
        const result = insertUsuarioSchema.safeParse(body);
        if (!result.success) {
            throw new Error('Invalid user data');
        }
        return this.usersService.createUser(result.data);
    }

    @Patch(':id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updates: any) {
        return this.usersService.updateUser(id, updates);
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteUser(id);
    }
}
