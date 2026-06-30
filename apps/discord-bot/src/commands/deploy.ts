import * as dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { deployCommands } from "./index";

deployCommands().then(() => process.exit(0));
