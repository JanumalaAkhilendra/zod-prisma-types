import * as PrismaClient from "@prisma/client";
import { z } from "zod";

export const MyPrismaScalarsTypeScalarFieldEnumSchema = z.nativeEnum(PrismaClient.Prisma.MyPrismaScalarsTypeScalarFieldEnum);