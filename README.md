# tsconfig-migrate

Migrate the tsconfig compilerOptions to other transformer options.

## Usage

```ts
import migrate from "tsconfig-migrate/oxc.js";
import { transform } from "oxc-transform";

transform(fileName, code, migrate(compilerOptions));
```

```ts
import migrate from "tsconfig-migrate/swc.js";
import { transform } from "@swc/core";

transform(code, migrate(compilerOptions));
```
