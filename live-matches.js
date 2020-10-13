class PubSub {
    constructor(){
        PubSub.observers = PubSub.observers || [];
    }
    subscribe(context, topicName, callBack){
        PubSub.observers.push({ context, topicName, callBack});
    }
    publish(topicName, message){
        let targetObservers = PubSub.observers.filter( item => item.topicName == topicName);
        targetObservers.forEach( item => {
            item.callBack.apply(item.context, [message])
        });
    }
}



class CricketMatch{
    constructor(){
        this.pubSub = new PubSub();
        CricketMatch.matchCompleted = CricketMatch.matchCompleted || 0;
    }
    startMatch(matchName){
        let key = Object.keys(CricketMatch.matches).find( key => CricketMatch.matches[key].name == matchName);
        if(!key){
            console.log(`Match ${matchName} not found`);
            return;
        }
        console.log(`
        ${matchName.toUpperCase()}  CRICKET MATCH HAS STARTED
        `);
        let scoreCard = CricketMatch.matches[key].scoreCard;
        for(let i = 0 ; i < scoreCard.length; i++){
            setTimeout(()=>{
                let j = i + 1;
                let over = Math.trunc( j / 6 );
                let ball =  j % 6;
                CricketMatch.matches[key].totalScore += scoreCard[i];
                let message = `
                Team Batting    : ${matchName.split('-vs')[0]}
                Over No.        : ${over}
                Ball No.        : ${ball}
                Run Scored      : ${scoreCard[i]}
                Total Score     : ${CricketMatch.matches[key].totalScore}
                `;
                this.pubSub.publish(matchName, message);
                if( j == scoreCard.length){
                    CricketMatch.matchCompleted += 1;
                    this.pubSub.publish(matchName, `MATCH ENDED`);
                    return;
                }
            }, i * 3000)
        }
    }

}
CricketMatch.matches = {
    indVsPak: {
        name: "india-vs-pakistan",
        scoreCard: [1,2,4,0,6,1,1,2,3,4,5,6,3,2,2,1,2,4,0,0,0,0,0],
        totalScore: 0
    },
    ausVsBan: {
        name: "australia-vs-bangladesh",
        scoreCard: [2,3,4,4,6,6,6,0,0,1,1,4,4,4,4,2,2,2,2,6],
        totalScore: 0
    }
};

class ESPN{
    constructor(){
        let pubSub =  new PubSub();
        let matchSubscribed = CricketMatch.matches.indVsPak.name;
        pubSub.subscribe(this,matchSubscribed,(response)=> {
            console.log(`
            ESPN REPORTING LIVE for ${matchSubscribed} ! @ ${ new Date().toLocaleTimeString()}:
            ${response}
            `);
        });
    }
}

class STAR_SPORT{
    constructor(){
        let pubSub =  new PubSub();
        let matchSubscribed = CricketMatch.matches.indVsPak.name;
        pubSub.subscribe(this,matchSubscribed,(response)=> {
            console.log(`
            STAR SPORTS REPORTING LIVE  for ${matchSubscribed} !  @ ${ new Date().toLocaleTimeString()}:
            ${response}
            `);
        });
    }
}

class SONY{
    constructor(){
        let pubSub =  new PubSub();
        let matchSubscribed = CricketMatch.matches.ausVsBan.name;
        pubSub.subscribe(this,matchSubscribed,(response)=> {
            console.log(`
            SONY REPORTING LIVE for ${matchSubscribed}  !  @ ${ new Date().toLocaleTimeString()}:
            ${response}
            `);
        });
    }
}

new ESPN();
new STAR_SPORT();
new SONY();

let cricketMatch = new CricketMatch();
cricketMatch.startMatch(CricketMatch.matches.indVsPak.name);
cricketMatch.startMatch(CricketMatch.matches.ausVsBan.name);

let pubSub = new PubSub();

let callBack = (response)=>{
    if(response == "MATCH ENDED" && CricketMatch.matchCompleted == 2){
        console.log("All Matches were completed hence killing process");
        process.kill(process.pid);
    }
}
pubSub.subscribe(this,CricketMatch.matches.indVsPak.name,callBack);
pubSub.subscribe(this,CricketMatch.matches.ausVsBan.name,callBack);

