import * as shell from "shelljs";

shell.cp("-R", "src/public/images", "dist/public/");
shell.cp("src/public/*", "dist/public/");
shell.cp("-R", "src/public/lib", "dist/public/");