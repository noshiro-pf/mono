@genType
let ifThen: (bool, bool) => bool = (antecedent, consequent) => !antecedent || consequent

Console.log(IdFn.idfn(ifThen(false, true)))
