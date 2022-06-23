// console.log('Loading function');

const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = async (event, context) => {
	// console.log('Received event:', JSON.stringify(event, null, 2));

	// Get the object from the event and show its content type
	const key = decodeURIComponent(event.queryStringParameters.key.replace(/\+/g, ' '));
	// Extract colour code from key
	const keyRegex = /^\/?(?:colour\/)?(.+)\.([a-fA-F\d]+).svg$/g;
	const match = keyRegex.exec(key);
	const params = {
		Bucket: process.env.S3_BUCKET,
		Key: `icons/${match[1]}.svg`
	};
	// console.log('Loading Object:', JSON.stringify(params, null, 2));
	try {
		const { ContentType, Body } = await s3.getObject(params).promise();
		// console.log('CONTENT TYPE:', ContentType);
		const svgContents = Body.toString('utf-8');
		const output = svgContents.replace(
			/#0{3,6}|black|rgb\(0,0,0\)|rgba\(0,0,0,1\)/g,
			`#${match[2]}`
		);
		const response = {
			statusCode: 200,
			headers: { 'content-type': ContentType, 'Access-Control-Allow-Origin': '*' },
			body: output
		};
		return response;
	} catch (err) {
		console.log(err);
		const message = `Error getting object ${key} from bucket. Make sure they exist and your bucket is in the same region as this function.`;
		console.log(message);
		throw new Error(message);
	}
};
