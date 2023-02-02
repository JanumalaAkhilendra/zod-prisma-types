import { writeNonScalarType, writeScalarType, writeSpecialType } from '..';
import { ExtendedDMMFSchemaField } from '../../classes';
import { type ContentWriterOptions } from '../../types';
import { writeSelect } from './writeSelect';

export const writeOutputObjectType = (
  { fileWriter, dmmf, getSingleFileContent = false }: ContentWriterOptions,
  field: ExtendedDMMFSchemaField,
) => {
  const { writer, writeImport, writeImportSet, writeHeading } = fileWriter;

  const { useMultipleFiles, prismaClientPath } = dmmf.generatorConfig;

  if (useMultipleFiles && !getSingleFileContent) {
    writeImport('{ z }', 'zod');
    writeImport('{ type Prisma }', prismaClientPath);
    writeImportSet(field.argTypeImports);

    // determine if the outputType should include the "select" or "include" field
    const modelWithSelect = dmmf.schema.getModelWithIncludeAndSelect(field);

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // ONLY FOR MULTI FILE IMPORTS!
    // The select schema needs to be in the same file as
    // the model's args schema to prevent circular imports.
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // Only write the select type if the outputType has a "select" or "include" field.
    // Some outputTypes like "CreateMany", "UpdateMany", "DeleteMany"
    // do not have a "select" or "include" field.

    if (modelWithSelect && field.shouldWriteSelectAndIncludeArgs) {
      // if the outputType has a "select" or "include" field,
      // the schemas that are used in the type of the field
      // needs to be imported
      writeImportSet(modelWithSelect.selectImports);

      writeHeading(
        'Select schema needs to be in file to prevent circular imports',
      );

      writeSelect(
        { fileWriter, dmmf, getSingleFileContent: true },
        modelWithSelect,
      );
    }
  }

  writer
    .blankLine()
    .write(`export const ${field.argName}Schema: `)
    .write(field.customArgType)
    .write(` = `)
    .write(`z.object(`)
    .inlineBlock(() => {
      writer
        .conditionalWriteLine(
          field.writeSelectArg,
          `select: ${field.modelType}SelectSchema.optional(),`,
        )
        .conditionalWriteLine(
          field.writeIncludeArg,
          `include: ${field.modelType}IncludeSchema.optional(),`,
        );
      field.args.forEach((arg) => {
        writer.write(`${arg.name}: `);

        const { isOptional, isNullable } = arg;

        if (arg.hasMultipleTypes) {
          writer.write(`z.union([ `);

          arg.inputTypes.forEach((inputType, idx) => {
            const writeComma = idx !== arg.inputTypes.length - 1;

            writeScalarType(writer, {
              inputType,
              writeLazy: false,
              writeComma,
            });
            writeNonScalarType(writer, {
              inputType,
              writeLazy: false,
              writeComma,
            });
            writeSpecialType(writer, {
              inputType,
              writeLazy: false,
              writeComma,
            });
          });

          writer
            .write(` ])`)
            .conditionalWrite(arg.isOptional, `.optional()`)
            .conditionalWrite(arg.isNullable, `.nullable()`)
            .write(`,`);
        } else {
          writeScalarType(writer, {
            inputType: arg.inputTypes[0],
            writeLazy: false,
            isNullable,
            isOptional,
          });
          writeNonScalarType(writer, {
            inputType: arg.inputTypes[0],
            writeLazy: false,
            isNullable,
            isOptional,
          });
          writeSpecialType(writer, {
            inputType: arg.inputTypes[0],
            writeLazy: false,
            isNullable,
            isOptional,
          });
        }

        writer.newLine();
      });
    })
    .write(`).strict()`);

  if (useMultipleFiles && !getSingleFileContent) {
    writer.blankLine().writeLine(`export default ${field.argName}Schema;`);
  }
};
