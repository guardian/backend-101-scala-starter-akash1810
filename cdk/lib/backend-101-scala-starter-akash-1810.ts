import { GuPlayApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuDistributionBucketParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';

export class Backend101ScalaStarterAkash1810 extends GuStack {
	constructor(scope: App, id: string, props: Omit<GuStackProps, 'env'>) {
		super(scope, id, {
			...props,
			env: { region: 'eu-west-1' },
		});

		const app = 'backend-101-scala-starter-akash1810';
		const domainName = `backend101-akash1810.gutools.co.uk`;

		const s3Path = [
			GuDistributionBucketParameter.getInstance(this).valueAsString,
			this.stack,
			this.stage,
			app,
		].join('/');

		const { loadBalancer } = new GuPlayApp(this, {
			app,
			access: { scope: AccessScope.PUBLIC },
			certificateProps: {
				domainName,
			},
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			monitoringConfiguration: { noMonitoring: true },
			scaling: { minimumInstances: 1 },
			imageRecipe: 'backend-101',
			userData: [
				'#!/bin/bash -ev',
				`aws s3 cp s3://${s3Path}/app.service /etc/systemd/system/${app}.service`,
				`aws s3 cp s3://${s3Path}/hello-world.jar /hello-world.jar`,
				`systemctl start ${app}`,
			].join('\n'),
		});

		new GuCname(this, 'dns-record', {
			app,
			domainName,
			ttl: Duration.minutes(1),
			resourceRecord: loadBalancer.loadBalancerDnsName,
		});
	}
}
