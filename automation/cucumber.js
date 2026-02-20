module.exports = {
    default: {
      require: ['src/features/step-definitions/**/*.js', 'src/support/**/*.js'],
      format: ['progress', 'allure-cucumberjs/reporter'],
      formatOptions: {
        resultsDir: 'reports/allure/allure-results'
      },
      paths: ['src/features/**/*.feature'],
    }
  }