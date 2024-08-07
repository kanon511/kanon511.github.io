import { PIdolData } from './data/pIdolData.js';
import { Contest } from './class/Contest.js';
import { AutoContest } from './class/AutoContest.js';
import { SkillCardData } from './data/skillCardData.js';
import { PIdol } from './class/PIdol.js';

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

export const DOM_text_to_elememt = (text) => {
    const temporaryDiv = document.createElement('div');
    temporaryDiv.innerHTML = text;
    return temporaryDiv.firstElementChild;
}

export const parseExecutionLog = (executeLog) => {
    let htmlString = '<div>';
    for (const log of executeLog) {
        if (log.type == 'use') {
            if (log.sourceType == 'skillCard') {
                htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-clone"></i>スキルカード「${log.source.name}」</div><div class="log-block-content">`;
            }
            else if (log.sourceType == 'pItem') {
                htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-chess-rook"></i>Pアイテム「${log.source.name}」</div><div class="log-block-content">`;
            }
            else if (log.sourceType == 'pDrink') {
                htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-wine-bottle"></i>Pドリンク「${log.source.name}」</div><div class="log-block-content">`;
            }
            else if (log.sourceType == 'pStatus') {
                htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-forward"></i>ステータス効果「${log.source.name}」</div><div class="log-block-content">`;
            }
            else if (log.sourceType == 'pDelay') {
                htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-link"></i>予約効果「${log.source.name}」</div><div class="log-block-content">`;
            }
            // else if (log.sourceType == 'pIdol') {
            //     htmlString += `<div><div><i class="fa-solid fa-person-rays"></i>${log.source.name}を使った</div>`;
            // }
            else if (log.sourceType == 'pRest') {
                htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-bed"></i>${log.source.name}</div><div class="log-block-content">`;
            }
        }
        else if (log.type == 'end') {
            htmlString += '</div></div>';
        }
        else if (log.type == 'show') {
            htmlString += `<div class="log-block"><div class="log-block-title"><i class="fa-solid fa-book-open"></i>${log.message}</div><div class="log-block-content">`;
        }
        else {
            htmlString += `<div>${log.message}</div>`;
        }
    }
    htmlString += '</div>';
    return DOM_text_to_elememt(htmlString);
}

export const parseSimulationLog = (simulationLog) => {
    const container = document.createElement('div');
    for (const log of simulationLog.log) {
        const textElement = `
        <div>
            <div class="log-turn" data-turnType="${log.turnType}">
                <div>${log.turn}ターン目　</div>
                <div class="log-turn-status">
                　
                    <i class="fa-solid fa-star"></i>${log.status.score}
                    <i class="fa-solid fa-heart"></i>${log.status.hp}
                    <i class="fa-solid fa-shield-halved"></i>${log.status.block}
                </div>
            </div>
        </div>`;
        container.appendChild(DOM_text_to_elememt(textElement));
        container.appendChild(parseExecutionLog(log.executionLog));
    }
    return container;
}

export const playerRun = (data,aiRun) => {
    let score = 0;

    const pIdol = new PIdol({ 
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
            if(card.cost.type=="status"){
                card_status_text = `消费：${card.cost.target}${card.cost.value}\n能力：`;
            }
            else{
                card_status_text = `消费：${card.cost.type}${card.cost.value}\n能力：`;
            }
            if(card.condition!=''){
                card_status_text+=`${card.condition}时才能使用\n`
            }
            for(let i of card.effects){
                if(i.condition!=null){
                    card_status_text+=`如果${i.condition}，`
                }
                if(i.type=="score"){
                    if(i.value!=null){
                        card_status_text+=`基础分+${i.value}`
                    }
                    if(i.options!=null){
                        if(i.options[0].type=="block")
                            card_status_text+=`增加元气${i.options[0].value}%的分数`
                        else if(i.options[0].type=="集中"){
                            card_status_text+=`（集中的影响为${i.options[0].value}倍）`
                        }
                        else
                            card_status_text+=`增加${i.options[0].type}${i.options[0].value}%的分数`
                    }
                    card_status_text+="\n"
                }
                else if(i.type=="block") card_status_text+=`元气+${i.value}\n`
                else if(i.type=="status") card_status_text+=`${i.target}+${i.value}\n`
            }
            if(card.limit == 1){
                card_status_text+="只能使用一次"
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
        console.log(contest.pIdol)
        let p_idol_status_text = `剩余回合：${pIdol.getStatus().remainTurn}  当前分数：${pIdol.getStatus().score}\n完成回合：`;

        let turnTypes = pIdol.getStatus().turnType.getAllTypes();
        for(let i=0;i<pIdol.getStatus().extraTurn;i++){
            turnTypes.push(turnTypes[data.turn-1])
        }
        let z ={
            "vocal":"红",
            "dance":"蓝",
            "visual":"黄",
        }
        for(let i in turnTypes){
            if(i<pIdol.getStatus().turn-1){
                p_idol_status_text+=`${z[turnTypes[i]]} `
            }else if(i==pIdol.getStatus().turn-1){
                p_idol_status_text+=`\n当前回合：${z[turnTypes[i]]}(${data.parameter[turnTypes[i]]}%)\n剩余回合：`
            }else{
                p_idol_status_text+=`${z[turnTypes[i]]} `
            }
        }

        p_idol_status_text += `\n元气：${pIdol.getStatus().block}  体力：${pIdol.getStatus().hp}/${pIdol.getStatus().maxHp}\n`

        + "当前拥有效果：\n";
        let status_list = pIdol.getStatus().pStatus.getAll();
        console.log(pIdol.getStatus().pStatus)
        for(let i in status_list){
            if(status_list[i]!=0){
                if(status_list[i]){
                    p_idol_status_text+=`${i}：${status_list[i]}\n`
                }else{
                    let value = pIdol.getStatus().pStatus.getValue(i)
                    if(value!=0)
                        p_idol_status_text+=`${i}：${value}\n`
                }
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
            if(contest.checkkFinishContest()){
                score=contest.getResult().finalStatus.score;
                //document.getElementById('contest-log-min').innerHTML = contest.log.text.replaceAll('\n', '<br>');
                const container0 =  document.getElementById(`contest-log-min`);
                DOM_delete_allChildren(container0);
                container0.appendChild(parseSimulationLog(contest.getResult()));
                let log = aiRun(score);
                const container1 =  document.getElementById(`contest-log-rnd`);
                DOM_delete_allChildren(container1);
                container1.appendChild(parseSimulationLog(log));
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

document.addEventListener('DOMContentLoaded', () => {
    const button =  document.getElementById(`random-button`);
    button.addEventListener('click',()=>{
        const element_main_character_select = document.getElementById('main-character');
        const main_character_id = element_main_character_select.value;
        const pIdol = PIdolData.getById(main_character_id);

        // カードセレクトを挿入
        const element_main_card_box = document.getElementById('main-character-cards-box');
        const element_sub_card_box  = document.getElementById('sub-character-card-box');
        
        const element_main_cards = element_main_card_box.childNodes;
        const element_sub_cards  = element_sub_card_box.childNodes;

        let cards = [];
        for(let i=0;i<10;i++){
            const targetCards = SkillCardData.getAll().filter(item=>
                (item.plan=='free'||item.plan==pIdol.plan) && // プラン指定
                item.id > 2000000 && // 基本カード削除
                String(item.id)[1] != '2' &&// キャラ固有削除)
                String(item.id)[1] != '3' // サポ固有削除)
            );
            const targetCard = targetCards[Math.floor(Math.random()*targetCards.length)];
            cards.push(targetCard)
        }

        element_main_cards.forEach((elem, idx) => {
            if(idx!=0){
                elem=elem.childNodes[1].childNodes[5]
                elem.value = Math.floor(cards[idx-1].id/2)*2;
                elem.parentNode.getElementsByClassName("checkbox")[0].checked = cards[idx-1].id % 2 > 0;
                elem.dispatchEvent(new Event("change"));
            }else{
                elem.parentNode.getElementsByClassName("checkbox")[0].checked = Math.random() > 0.5;
                elem.dispatchEvent(new Event("change"));
            }
        });
        element_sub_cards.forEach((elem, idx) => {
            if(idx!=0){
                elem=elem.childNodes[1].childNodes[5]
                elem.value = Math.floor(cards[idx+4].id/2)*2;
                elem.parentNode.getElementsByClassName("checkbox")[0].checked = cards[idx+4].id % 2 > 0;
                elem.dispatchEvent(new Event("change"));
            }else{
                elem.parentNode.getElementsByClassName("checkbox")[0].checked = Math.random() > 0.5;
                elem.dispatchEvent(new Event("change"));
            }
        });
    })
})