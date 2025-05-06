/**
 * 企业实体类
 */
export class Enterprise {
  id?: number;
  name: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  logoPath?: string;
  website?: string;
  description?: string;
  licenseCode?: string;
  licenseImage?: string;
  establishedTime?: Date | string;
  status: number; // 0-禁用，1-正常
  createdTime: Date | string;
  updatedTime: Date | string;

  constructor(data?: Partial<Enterprise>) {
    this.name = data?.name || '';
    this.address = data?.address;
    this.contactPerson = data?.contactPerson;
    this.contactPhone = data?.contactPhone;
    this.email = data?.email;
    this.logoPath = data?.logoPath;
    this.website = data?.website;
    this.description = data?.description;
    this.licenseCode = data?.licenseCode;
    this.licenseImage = data?.licenseImage;
    this.establishedTime = data?.establishedTime;
    this.status = data?.status ?? 1;
    this.createdTime = data?.createdTime || new Date();
    this.updatedTime = data?.updatedTime || new Date();
  }
} 