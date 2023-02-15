import { readFileContent, getPackageJson } from '../src/file'

describe('File Utils', () => {
  describe('readFileContent', () => {
    it('should read the file contents as a UTF8 encoded string', async () => {
      const filePath = './test/fixtures/file.txt'
      const result = await readFileContent(filePath)

      expect(result).toBe('This is a test file.\n')
    })

    it('should allow specifying the file encoding', async () => {
      const filePath = './test/fixtures/file.txt'
      const encoding = 'ascii'

      const result = await readFileContent(filePath, encoding)

      expect(result).toBe('This is a test file.\n')
    })
  })

  describe('getPackageJson', () => {
    it('should return the package.json object parsed', async () => {
      const packageJsonPath = './test/fixtures/package.json'

      const result = await getPackageJson(packageJsonPath)

      expect(result).toEqual({ name: 'my-package', version: '1.0.0' })
    })
  })
})
