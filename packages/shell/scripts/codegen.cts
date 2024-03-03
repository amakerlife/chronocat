import { dump, load } from 'js-yaml'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Definition, PartialArgs } from 'typescript-json-schema'
import { buildGenerator, programFromConfig } from 'typescript-json-schema'

const settings: PartialArgs = {
  aliasRef: true,
  titles: false,
  defaultProps: true,
  noExtraProps: true,
  propOrder: false,
  required: true,
  strictNullChecks: true,
  skipLibCheck: true,
}

void (async () => {
  console.log('Building generator...')

  const generator = buildGenerator(
    programFromConfig(resolve(__dirname, 'tsconfig.entity.json')),
    settings,
  )!

  const schemas = generator.getUserSymbols().map((x) => ({
    $id: x,
    ...generator.getSchemaForSymbol(x),
  }))

  await writeFile(
    resolve(__dirname, '../generated/schemas.json'),
    JSON.stringify(schemas, null, 2),
  )

  console.log('Generating schemas for codegen...')

  console.log('Modifying schemas for codegen...')

  console.log('Writing schemas for codegen...')

  console.log('Generating schemas for openapi...')

  let oapiDefinitions = generator.getSchemaForSymbols(
    generator.getUserSymbols(),
  )

  console.log('Modifying schemas for openapi...')

  oapiDefinitions = JSON.parse(
    JSON.stringify(oapiDefinitions)
      .replaceAll(
        '"anyOf"',
        '"type":"object","discriminator":{"propertyName":"type"},"oneOf"',
      )
      .replaceAll('#/definitions/', '#/components/schemas/'),
  ) as Definition

  console.log('Writing ChronocatConfig for openapi...')

  const openapiSource = load(
    await readFile(resolve(__dirname, '../static/openapi.yaml'), 'utf-8'),
  ) as {
    components: {
      schemas: unknown
    }
  }

  openapiSource.components.schemas = oapiDefinitions.definitions

  await writeFile(
    resolve(__dirname, '../../docs/static/openapi.yaml'),
    dump(openapiSource),
  )
})()
