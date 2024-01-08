import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAutoMessageEventInputDto {
  @IsInt()
  autoMessageEventId: number;

  @IsOptional()
  @IsString()
  autoMessageEventName?: string;

  @IsInt()
  selectedSegmentId: number;

  @IsString()
  selectedValue: string;

  @IsOptional()
  @IsString()
  selectedFilter?: string;

  @IsOptional()
  userInputs?: any;

  @IsOptional()
  excludeValues?: any;

  @IsOptional()
  @IsString()
  localButtonText?: string;

  @IsOptional()
  @IsInt()
  FilteredTableNum?: number;

  @IsOptional()
  @IsInt()
  fatigueLevelDay?: number;

  @IsOptional()
  @IsString()
  timeColumnName?: string;

  @IsOptional()
  @IsString()
  textAreaValue?: string;

  @IsOptional()
  @IsString()
  inputValue?: string;

  @IsOptional()
  @IsString()
  phoneReceiveNumValue?: string;

  @IsOptional()
  @IsString()
  selectedReceiverNumberName?: string;

  @IsOptional()
  @IsString()
  phoneSendNumValue?: string;

  @IsOptional()
  @IsBoolean()
  isTextAreaClicked?: boolean;

  @IsOptional()
  @IsBoolean()
  advertisingConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  guidanceConsent?: boolean;

  @IsOptional()
  @IsString()
  selectedTrigger?: string;

  @IsOptional()
  @IsString()
  selectedColumnName?: string;

  @IsOptional()
  @IsString()
  inputValueColumnName?: string;

  @IsOptional()
  columnData?: any;

  @IsOptional()
  @IsString()
  selectedPeriod?: string;

  @IsOptional()
  selectedDaysOfWeek?: any;

  @IsOptional()
  @IsNumber()
  hour?: number;

  @IsOptional()
  @IsNumber()
  minute?: number;

  @IsOptional()
  @IsString()
  date?: string;

  /**auth */
  @IsOptional()
  @IsString()
  email?: string;
}
