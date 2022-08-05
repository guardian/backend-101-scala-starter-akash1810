import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { Template } from 'aws-cdk-lib/assertions';
import { Backend101ScalaStarterAkash1810 } from './backend-101-scala-starter-akash-1810';

describe('The Backend101ScalaStarterAkash1810 stack', () => {
	it('matches the snapshot', () => {
		const app = new GuRoot();
		const stack = new Backend101ScalaStarterAkash1810(
			app,
			'Backend101ScalaStarterAkash1810',
			{ stack: 'deploy', stage: 'TEST' },
		);
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
