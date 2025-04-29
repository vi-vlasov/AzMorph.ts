module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }],
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  testMatch: ["**/test/**/*.test.ts"],
};
