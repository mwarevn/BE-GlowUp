enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

enum Role {
    ADMIN = 'ADMIN',
    STYLIST = 'STYLIST',
    CUSTOMER = 'CUSTOMER',
}

enum Rank {
    BRONZE = 'BRONZE',
    GOLD = 'GOLD',
    DIAMON = 'DIAMON',
}

interface ProfileCustomer {
    rank: Rank;
    rewards: number;
}

interface ProfileStylist {
    experience: string;
    reviews: number;
    isWorking: boolean;
}

interface ProfileAdmin {}

interface User {
    is: string; // unique string
    gender: Gender;
    role: Role;

    profile: ProfileCustomer | ProfileStylist | ProfileAdmin;

    full_name: string;
    phone_number: string; // length = 10
    password: string;
    avatar: string;
    date_of_birth: Date;
    address: string;

    access_token: string;
    refresh_token: string;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
