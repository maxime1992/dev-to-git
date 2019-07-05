import { DevToGit, DEFAULT_CONFIG_PATH } from '../src/dev-to-git'

describe(`DevToGit`, () => {
  beforeEach(() => {
    process.argv = ['don-t-care', 'don-t-care']
    process.env.DEV_TO_GIT_TOKEN = 'token'
  })

  describe(`Config`, () => {
    describe(`Get config`, () => {
      it(`should have by default a path "./dev-to-git.json"`, () => {
        const devToGit = new DevToGit()
        expect(devToGit.getConfigPath()).toBe(DEFAULT_CONFIG_PATH)
      })

      it(`should accept a "config" argument to change the path to the config`, () => {
        const CUSTOM_CONFIG_PATH: string = './custom/dev-to-git.json'
        process.argv = [
          'don-t-care',
          'don-t-care',
          '--config',
          CUSTOM_CONFIG_PATH
        ]
        const devToGit = new DevToGit()
        expect(devToGit.getConfigPath()).toBe(CUSTOM_CONFIG_PATH)
      })

      it(`should use the default path if the "config" flag is passed without nothing`, () => {
        process.argv = ['don-t-care', 'don-t-care', '--config']
        const devToGit = new DevToGit()
        expect(devToGit.getConfigPath()).toBe(DEFAULT_CONFIG_PATH)
      })
    })

    describe(`Read config from file`, () => {
      it(`test`, () => {
        process.argv = [
          'don-t-care',
          'don-t-care',
          '--config',
          './test/dev-to-git.json'
        ]

        const devToGit = new DevToGit()

        expect(devToGit.readConfigFile()).toEqual(require('./dev-to-git.json'))
      })
    })
  })

  // describe(`Article`, () => {
  //   describe(`Read`, () => {
  //     it(`should read an article from the configuration`, () => {
  //       const CUSTOM_CONFIG_PATH: string = './test/dev-to-git.json'
  //       process.argv = [
  //         'don-t-care',
  //         'don-t-care',
  //         '--config',
  //         CUSTOM_CONFIG_PATH
  //       ]
  //       const devToGit = new DevToGit()
  //       expect(devToGit.readArticleOnDisk()).toContain(
  //         'This is my awesome article!'
  //       )
  //       expect(devToGit.readArticleOnDisk()).toContain('Hey, some text!')
  //     })
  //   })
  //   describe(`Publish`, () => {
  //     it(`should publish the article`, () => {
  //       const CUSTOM_CONFIG_PATH: string = './test/dev-to-git.json'
  //       process.argv = [
  //         'don-t-care',
  //         'don-t-care',
  //         '--config',
  //         CUSTOM_CONFIG_PATH
  //       ]
  //       const devToGit = new DevToGit()
  //       devToGit.publishArticle(devToGit.readConfigFile()[0])
  //     })
  //   })
  // })
})
