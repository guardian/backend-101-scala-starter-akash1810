import { GuCertificate } from '@guardian/cdk/lib/constructs/acm';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import {
	SubnetType as GuSubnetType,
	GuVpc,
} from '@guardian/cdk/lib/constructs/ec2';
import { GuApplicationLoadBalancer } from '@guardian/cdk/lib/constructs/loadbalancing/alb';
import { App, Tags } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import type { ISubnet } from 'aws-cdk-lib/aws-ec2';
import {
	ContainerImage,
	CpuArchitecture,
	OperatingSystemFamily,
} from 'aws-cdk-lib/aws-ecs';
import type {
	ApplicationLoadBalancedFargateServiceProps,
	ApplicationLoadBalancedTaskImageOptions,
} from 'aws-cdk-lib/aws-ecs-patterns';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

export class DistrolessContainerExperiments extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		Tags.of(this).add('Owner', 'DevX');

		const app = 'distroless';
		const domainName = `${app}.code.dev-gutools.co.uk`;
		const vpc = GuVpc.fromIdParameter(this, 'vpc');
		const publicLbSubnets: ISubnet[] = GuVpc.subnetsFromParameter(this, {
			type: GuSubnetType.PUBLIC,
		});
		const privateSubnets: ISubnet[] = GuVpc.subnetsFromParameter(this, {
			type: GuSubnetType.PRIVATE,
		});

		// TODO get the image dynamically
		const imageLocation =
			'ghcr.io/guardian/backend-101-scala-starter-akash1810:docker';

		// TODO what about private container images?
		const taskImageOptions: ApplicationLoadBalancedTaskImageOptions = {
			containerPort: 9000,
			image: ContainerImage.fromRegistry(imageLocation),
		};

		const fargateProps: ApplicationLoadBalancedFargateServiceProps = {
			publicLoadBalancer: true,
			taskImageOptions,
			vpc,
			taskSubnets: { subnets: privateSubnets },
			certificate: new GuCertificate(this, { app, domainName }),
			loadBalancer: new GuApplicationLoadBalancer(this, 'ALB', {
				app,
				vpc,
				internetFacing: true,
				vpcSubnets: { subnets: publicLbSubnets },
				deletionProtection: false,
			}),
			runtimePlatform: {
				cpuArchitecture: CpuArchitecture.ARM64,
				operatingSystemFamily: OperatingSystemFamily.LINUX,
			},
		};
		const pb = new ApplicationLoadBalancedFargateService(
			this,
			'Fargate',
			fargateProps,
		);

		new GuCname(this, 'Cname', {
			app,
			domainName,
			ttl: Duration.minutes(1),
			resourceRecord: pb.loadBalancer.loadBalancerDnsName,
		});
	}
}
