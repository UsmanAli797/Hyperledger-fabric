/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
"encoding/json"
"fmt"
"strconv"

"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a car
type SmartContract struct {
contractapi.Contract
}

// Car describes basic details of what makes up a car
type Car struct {
Make   string `json:"make"`
Model  string `json:"model"`
Colour string `json:"colour"`
Owner  string `json:"owner"`
}
type User struct {
	Fname   string `json:"fname"`
	Lname  string `json:"lname"`
	IdCard string `json:"idCard"`
	Email  string `json:"email"`
	Pass  string `json:"pass"`

	}
	


// QueryResult structure used for handling result of query
type QueryResult struct {
Key    string `json:"Key"`
Record *Car
}

// InitLedger adds a base set of cars to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
cars := []Car{
Car{Make: "Toyota", Model: "Prius", Colour: "blue", Owner: "Tomoko"},

}

for i, car := range cars {
carAsBytes, _ := json.Marshal(car)
err := ctx.GetStub().PutState("CAR"+strconv.Itoa(i), carAsBytes)

if err != nil {
return fmt.Errorf("Failed to put to world state. %s", err.Error())
}
}

return nil
}

// CreateCar adds a new car to the world state with given details
func (s *SmartContract) CreateCar(ctx contractapi.TransactionContextInterface, carNumber string, make string, model string, colour string, owner string) error {
car := Car{
Make:   make,
Model:  model,
Colour: colour,
Owner:  owner,
}

carAsBytes, _ := json.Marshal(car)

return ctx.GetStub().PutState(carNumber, carAsBytes)
}
func (s *SmartContract) CreateUser(ctx contractapi.TransactionContextInterface, userNumber string, fname string, lname string, idCard string, email string,pass string) error {
	user := User{
	Fname:   fname,
	Lname:  lname,
	IdCard: idCard,
	Email:  email,
	Pass:  pass,
	}
	
	userAsBytes, _ := json.Marshal(user)
	
	return ctx.GetStub().PutState(userNumber, userAsBytes)
	}

	//Create Complaint
	type Complaint struct {
		Name   string `json:"name"`
		IdCard string `json:"idCard"`
		Email  string `json:"email"`
		Phone  string `json:"phone"`
		Date  string `json:"date"`
		Casee  string `json:"casee"`
		Desc  string `json:"desc"`
		Image  string `json:"image"`




	
		}

	func (s *SmartContract) CreateComplaint(ctx contractapi.TransactionContextInterface, complaintNumber string, name string, idCard string, email string,phone string,date string,casee string,desc string,image string) error {
		complaint := Complaint{
		Name:   name,
		IdCard:  idCard,
		Email:  email,
		Phone:  phone,
		Date: date,
		Casee: casee,
		Desc: desc,
		Image: image,
		}
		
		complaintAsBytes, _ := json.Marshal(complaint)
		
		return ctx.GetStub().PutState(complaintNumber, complaintAsBytes)
		}

// QueryCar returns the car stored in the world state with given id
func (s *SmartContract) QueryUser(ctx contractapi.TransactionContextInterface, Email string) (*User, error) {
userAsBytes, err := ctx.GetStub().GetState(Email)

if err != nil {
return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
}

if userAsBytes == nil {
return nil, fmt.Errorf("%s does not exist", Email)
}

user := new(User)
_ = json.Unmarshal(userAsBytes, user)

return user, nil
}

// QueryAllCars returns all cars found in world state
func (s *SmartContract) QueryAllCars(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
startKey := ""
endKey := ""

resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

if err != nil {
return nil, err
}
defer resultsIterator.Close()

results := []QueryResult{}

for resultsIterator.HasNext() {
queryResponse, err := resultsIterator.Next()

if err != nil {
return nil, err
}

car := new(Car)
_ = json.Unmarshal(queryResponse.Value, car)

queryResult := QueryResult{Key: queryResponse.Key, Record: car}
results = append(results, queryResult)
}

return results, nil
}

// Chaincode for login
func (s *SmartContract) Login(ctx contractapi.TransactionContextInterface, Email string, pass string) bool {
	user, err := s.QueryUser(ctx, Email)
	if err != nil {
		return false
	}

	// if email == user.Email {
	// 	return true
	// }


	if user.Pass == pass {
	fmt.Printf("Successfull Login: %s",Email)
		return true
}



	return false
}

func main() {

chaincode, err := contractapi.NewChaincode(new(SmartContract))

if err != nil {
fmt.Printf("Error create fabcar chaincode: %s", err.Error())
return
}

if err := chaincode.Start(); err != nil {
fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
}
}
