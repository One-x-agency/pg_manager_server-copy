-- migrate:up

insert into "country" ("id","name","code") values ('5fc371f0-1405-477d-a7f7-0bda94241ede','India','91');
insert into "state" ("id","countryId","name") values ('26bce2cf-21a7-4c86-b440-20c3cea53bc9','5fc371f0-1405-477d-a7f7-0bda94241ede','Gujarat');
insert into "city" ("id","stateId","name") values
('b404fd23-fffd-4269-b009-8f9d6af05230','26bce2cf-21a7-4c86-b440-20c3cea53bc9','Ahmedabad'),
('7ca54c55-4677-4cba-bc77-9d2fd5391c07','26bce2cf-21a7-4c86-b440-20c3cea53bc9','Rajkot');


-- migrate:down

