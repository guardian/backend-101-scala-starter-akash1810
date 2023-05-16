import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs';
import { DistrolessContainerExperiments } from '../lib/fargate';

const app = new GuRootExperimental();

new DistrolessContainerExperiments(app, 'DistrolessContainerExperiments', {
	stack: 'playground',
	stage: 'CODE',
	env: {
		region: 'eu-west-1',
	},
});
