import { PartialType } from '@nestjs/swagger';
import { EngagementDto } from '../../cart/dto/engagement.dto';

export class UpdateEngagementDto extends PartialType(EngagementDto) {}
