import { Contest } from './class/Contest.js';
import { ContestPIdol } from './class/ContestPIdol.js';
import { AutoContest } from './class/AutoContest.js';
import { skillCardData } from './data/skillCardData.js';

export const DOM_delete_allChildren = (parent) => {
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

export const DOM_set_select_options = (select, item_list, isBlank) => {
    const fragment = document.createDocumentFragment();
    if (isBlank) {
        const option = document.createElement('option');
        option.innerHTML = '-';
        option.value = '-1';
        fragment.appendChild(option);
    }
    item_list.forEach((item, i)=>{
        const option = document.createElement('option');
        option.innerHTML = item.name;
        option.value = item.id;
        fragment.appendChild(option);
    });
    DOM_delete_allChildren(select);
    select.appendChild(fragment);
}

export const playerRun = (data,aiRun) => {
    let score = 0;

    const pIdol = new ContestPIdol({ 
        parameter: data.parameter, 
        plan: data.plan,
        pItemIds: data.pItemIds,
        skillCardIds: data.skillCardIds,
    });

    const contest = new Contest({
        pIdol: pIdol,
        maxTurn: data.turn,
        criteria: data.criteria,
        turnTypes: data.turnTypes,
    });

    const use_card_list = document.getElementById('use_card_list');
    const p_idol_status = document.getElementById('p_idol_status');
    const card_status = document.getElementById('card_status');
    let change = () => {
        let card_status_text;
        if(use_card_list.value<0){
            card_status_text = "回复2体力，并跳过此回合"
        }else{
            let hands = contest.getHands();
            let card = hands[use_card_list.value];
            card_status_text = `消费：${card.cost.type}：${card.cost.value}\n能力：`;
            for(let i of card.effects){
                card_status_text+=`${i.type}：${i.value}\n`
            }
            if(card.afterUse != null){
                card_status_text+="一回合只能使用一次"
            }
        }
        document.getElementById('card_status').innerHTML = card_status_text.replaceAll('\n', '<br>');
    };
    let update = () => {
        let hands = contest.getHands();
        console.log(hands);
        let card_list = [{
            id:-1,
            name:"休息",
        }]
        for(let i in hands){
            card_list.push({
                id:i,
                name:hands[i].name,
            })
        }
        DOM_set_select_options(use_card_list,card_list,false);

        let p_idol_status_text = `剩余回合：${contest.pIdol.remain_turn}  当前分数：${contest.pIdol.score}\n完成回合：`;

        let turnTypes = contest.pIdol.turnType.getAllTypes();
        for(let i=0;i<contest.pIdol.extraTurn;i++){
            turnTypes.push(turnTypes[data.turn-1])
        }
        let z ={
            "vocal":"红",
            "dance":"蓝",
            "visual":"黄",
        }
        for(let i in turnTypes){
            if(i<contest.pIdol.turn-1){
                p_idol_status_text+=`${z[turnTypes[i]]} `
            }else if(i==contest.pIdol.turn-1){
                p_idol_status_text+=`\n当前回合：${z[turnTypes[i]]}(${contest.pIdol.parameter[turnTypes[i]]}%)\n剩余回合：`
            }else{
                p_idol_status_text+=`${z[turnTypes[i]]} `
            }
        }

        p_idol_status_text += `\n元气：${contest.pIdol.block}  体力：${contest.pIdol.hp}/${contest.pIdol.maxHp}\n`

        + "当前拥有效果：\n";
        let status_list = contest.pIdol.status.getAll();
        for(let i in status_list){
            if(status_list[i]!=0){
                p_idol_status_text+=`${i}：${status_list[i]}\n`
            }
        }

        p_idol_status.innerHTML = p_idol_status_text.replaceAll('\n', '<br>');
        change();
    }

    contest.startTurn();
    update();

    const element_use_button = document.getElementById('use-button');
    let addEvent = () => {
        if(contest.useCard(Number(use_card_list.value))){
            contest.finishTurn();
            console.log(contest.pIdol);
            if(contest.isFinish){
                score=contest.log.score;
                document.getElementById('contest-log-min').innerHTML = contest.log.text.replaceAll('\n', '<br>');
                aiRun(score);
                element_use_button.removeEventListener('click', addEvent);
            }else{
                contest.startTurn();
                update();
            }
        }else{
            update();
        }
    };
    element_use_button.removeEventListener('click', addEvent);
    element_use_button.addEventListener('click', addEvent, false);

    
    use_card_list.removeEventListener('change',change);
    use_card_list.addEventListener('change',change);
}