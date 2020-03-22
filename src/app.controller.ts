import {
	Controller,
	Post,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Open } from 'unzipper';

const filter = [
	'agency.txt',
	'calendar_dates.txt',
	'stop_times.txt',
	'trips.txt',
	'stops.txt',
	'calendar.txt',
	'routes.txt',
];

type UploadedFile = {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
};

@Controller()
export class AppController {
	@Post('upload')
	@UseInterceptors(FileInterceptor('gtfs'))
	async uploadFile(@UploadedFile() gtfs: UploadedFile): Promise<string> {
		const directory = await Open.buffer(gtfs.buffer);

		const tables = {};

		for (const file of directory.files) {
			if (!filter.includes(file.path)) continue;
			const tableName = file.path.slice(0, file.path.length - 4);

			tables[tableName] = await file
				.buffer()
				.then(buffer => buffer.toString('utf-8'));
		}

		return JSON.stringify(tables);
	}
}
