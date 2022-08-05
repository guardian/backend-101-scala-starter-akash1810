import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { Backend101ScalaStarterAkash1810 } from '../lib/backend-101-scala-starter-akash-1810';

const app = new GuRoot();
new Backend101ScalaStarterAkash1810(
	app,
	'Backend101ScalaStarterAkash1810-PROD',
	{ stack: 'deploy', stage: 'PROD' },
);
