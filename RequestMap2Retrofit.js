const fs = require('fs');
fs.readFile('/Users/jxy/Downloads/test.java', (err, data) => {
	if (err) throw err;

	// 去掉空行,转换制表为空格
	const classText=data.toString().replace(/\n(\s*)\n/g,'\n').replace('\t','    ');
	// 得到类内内容
	const innerText=classText.substring(classText.indexOf('{'),classText.lastIndexOf('}'));
	
	const retrofitFuncs=[];
	
	for(index=0;index<innerText.length;){
		const {retrofit,next}=parseNextRequestFunction(index,innerText);
		if(next==-1){
			break;
		}
		index=next;
		retrofitFuncs.push(retrofit);
	}
	
	console.log(retrofitFuncs.join('\n'));
});



function parseNextRequestFunction(start,text) {
	const annoationIndex=text.indexOf('@RequestMapping',start);
	if(annoationIndex==-1){
		return{
			next:-1
		}
	}
	const annoationEndIndex=text.indexOf(')',annoationIndex);
	const commentIndex=getCommentIndex(start, text,annoationIndex);
	const codeIndex=text.indexOf('{',annoationEndIndex);
	let comment=text.substring(commentIndex,annoationIndex).trim();
	//格式化comment,每行去除行首空格，但是除了第一行外，其余的都要加个空格以对齐
	comment=comment.split('\n').map(x=>' '+x.trim()).join('\n').slice(1);
	const annoation=text.substring(annoationIndex,annoationEndIndex+1).trim();
	const func=text.substring(annoationEndIndex+1,text.lastIndexOf(')',codeIndex)+1).trim();
	
	const retrofit=comment+'\n'+getRetrofitAnnoation(annoation)+'\n'+getRetrofitFunc(func)+';\n';
	
	
	return {
		retrofit,
		next:getNextIndex(text, codeIndex)
	}
	
}

//利用括号匹配找到下一个出发点
function getNextIndex(text,beginIndex) {
	for(leftBracketNum=1,index=beginIndex+1;leftBracketNum!==0;index++){
		leftBracketNum+=(text[index]=='{');
		leftBracketNum-=(text[index]=='}');
	}
	return index;
}

function getRetrofitAnnoation(annoation) {
	//按,分割成参数组
	const parametersInline=annoation.substring(annoation.indexOf('(')+1,annoation.lastIndexOf(')')).split(',');
	const parameters={};
	//按=分成kv
	parametersInline.map(x=>{
		const kv=x.split('=').map(x=>x.trim());
		parameters[kv[0]]=kv[1];
	});
	if(!parameters['method']){
		parameters['method']='RequestMethod.GET';
	}
	
	//生成retrofit注解
	return '@'+parameters.method.split('.')[1]+'('+parameters.value+')';
}

const annoationDictionary={
	'PathVariable':'Path',
	'RequestBody':'Body'
}

function getRetrofitFunc(func) {
	const firstSpaceIndex=func.indexOf(' ');
	const funcParameterBeginIndex=func.indexOf('(',firstSpaceIndex);
	const returnType=func.substring(0,firstSpaceIndex);
	const funcName=func.substring(firstSpaceIndex,funcParameterBeginIndex).trim();
	const funcParameter=func.substring(funcParameterBeginIndex+1,func.length-1);
	
	return 'Call<'+returnType+'> '+funcName+'('+funcParameter.split(',').map(x=>{
		let t=x;
		for (key in annoationDictionary){
			t=t.replace(key,annoationDictionary[key]);
		}
		return t;
	}).join(',')+')';


}


function getCommentIndex(start,text,annoationIndex) {
	const lastDocCommentIndex=text.lastIndexOf('/*',annoationIndex);
	const lastInlineCommentIndex=text.lastIndexOf('//',annoationIndex);
	const lastFunctionIndex=text.lastIndexOf('}',annoationIndex);
	const lastStatementIndex=text.lastIndexOf(';',annoationIndex);
	const minAllowIndex=Math.max(Math.max(lastFunctionIndex,lastStatementIndex),start);
	// 取Doc和inline中最小的，但是也要比minIndex大,如果没有比minIndex大的，就取annoationIndex
	const minCommitIndex=Math.min(lastDocCommentIndex,lastInlineCommentIndex);
	const maxCommitIndex=Math.max(lastDocCommentIndex,lastInlineCommentIndex);
	if(maxCommitIndex<=minAllowIndex){
		return annoationIndex;
	}else if(minCommitIndex<=minAllowIndex){
	 	return maxCommitIndex;
	}else{
		return minAllowIndex;
	}
}
