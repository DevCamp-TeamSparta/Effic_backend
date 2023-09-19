import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { PhonebookList, AllContacts } from './phonebook.entity';

@Injectable()
export class PhonebookListRepository extends Repository<PhonebookList> {
  constructor(private datasource: DataSource) {
    super(PhonebookList, datasource.createEntityManager());
  }

  async findOneByPhonebookId(phonebookId) {
    return await this.findOne({ where: { phonebookId } });
  }

  async findOneByPhonebookIdAndUserId(phonebookId, userId) {
    return await this.findOne({ where: { phonebookId, userId } });
  }

  async findAllByUserId(userId) {
    return await this.find({ where: { userId } });
  }
}

@Injectable()
export class AllContactsRepository extends Repository<AllContacts> {
  constructor(private datasource: DataSource) {
    super(AllContacts, datasource.createEntityManager());
  }
  async findOneByUserIdAndPhoneNumber(userId, number) {
    return await this.findOne({
      where: {
        userId: userId,
        number: number,
      },
    });
  }

  async findOneByContactId(contactId) {
    return await this.findOne({ where: { contactId } });
  }
}
