import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('search')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    async search(@Query('q') q: string) {
        return this.searchService.globalSearch(q);
    }
}
