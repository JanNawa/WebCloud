CREATE TABLE IF NOT EXISTS `cloud`.`jobs` (
`jobID` VARCHAR(10) NOT NULL,
`partID` int NOT NULL,
`qty` int NOT NULL,
PRIMARY KEY (`jobID`, `partID`));

INSERT INTO `cloud`.`jobs` VALUES ('job1', 1, 11);
INSERT INTO `cloud`.`jobs` VALUES ('job2', 2, 22);
INSERT INTO `cloud`.`jobs` VALUES ('job3', 3, 33);

select * from cloud.jobs;
