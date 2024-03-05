import { IsString, IsEmail, IsAlphanumeric, IsArray, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsAlphanumeric()
    password: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    preferences: string[];

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    dietary_restrictions: string[];

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    viewing_habits: string[];

    @IsEnum(['active', 'inactive'])
    @IsOptional()
    subscription_status: string;
}

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    password: string;
}
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString({ each: true })
    preferences?: string[];
  
    @IsOptional()
    @IsString({ each: true })
    dietary_restrictions?: string[];
  
    @IsOptional()
    @IsString({ each: true })
    viewing_habits?: string[];
  
    @IsOptional()
    @IsEnum(['customer', 'admin'])
    role?: string;
  
    @IsOptional()
    @IsEnum(['active', 'inactive', 'suspended'])
    subscription_status?: string;
  }