import {
  attribute,
  hashKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';
import { Customer } from '../type';

@table('users')
export class User {
  @hashKey()
  id?: string;
  
  @attribute()
  customerId?: string;

  customer?: Customer;
}