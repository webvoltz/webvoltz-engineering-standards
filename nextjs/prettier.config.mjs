import commonPrettierConfig from '../common/prettier/config.mjs';

const nextjsPrettierConfig = {
  ...commonPrettierConfig,
  overrides: [
    {
      files: 'next-env.d.ts',
      options: {
        singleQuote: false,
      },
    },
  ],
  singleAttributePerLine: true,
};

export default nextjsPrettierConfig;
