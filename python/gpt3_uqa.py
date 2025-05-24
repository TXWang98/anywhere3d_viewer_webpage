import argparse
import json
import pickle
from functools import partial

import bson
import openai
from transformers import T5ForConditionalGeneration, T5Tokenizer

from human_study import bson_to_accuracy

key_pool = [
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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',
 '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'
]

key_id = 0
def setup_gpt3():
    # Load your API key from an environment variable or secret management service
    global key_id
    openai.api_key = key_pool[key_id]

def run_gpt3(prompt):
    global key_id
    while True:
        try:
            ret = openai.Completion.create(model="text-davinci-003", prompt=prompt, temperature=0, max_tokens=20)['choices'][0]['text']
            break
        except:
            print('no enough balance for key No.{} '.format(key_id), key_pool[key_id % len(key_pool)])
            key_id += 1
            openai.api_key = key_pool[key_id % len(key_pool)]
            continue
    return ret

def setup_uqa(model):
    assert model in ['small', 'base', 'large', '3b', '11b']
    model_name = "allenai/unifiedqa-v2-t5-{}-1251000".format(model)
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    return T5ForConditionalGeneration.from_pretrained(model_name).cuda(), tokenizer


def run_uqa(model, tokenizer, prompt, **generator_args):
    input_ids = tokenizer.encode(prompt, return_tensors="pt").cuda()
    res = model.generate(input_ids, **generator_args)
    return tokenizer.batch_decode(res, skip_special_tokens=True)[0]


def merge_data(data, annotation):
    ret_data = []
    for i in data['questions']:
        qid = i['question_id']
        for ind, j in enumerate(annotation['annotations']):
            if j['question_id'] == qid:
                ret_data.append((i, j))
                break
    return ret_data


def sqa_to_bson(data, output):
    with open(output, 'wb') as f:
        for i in data:
            f.write(bson.encode({
                'scene_id': i['scene_id'],
                'agent_rot': i['agent_rot'],
                'agent_pos': i['agent_pos'],
                'question': i['question'],
                'situation': i['situation'],
                'answer': i['answer'],
                'answer_confidence': 'yes'
            }))


if __name__ == '__main__':
    args_parser = argparse.ArgumentParser(description='')
    args_parser.add_argument('--model', type=str, default='uqa-base')
    args_parser.add_argument('--max_sent', type=int, default=30)
    args_parser.add_argument('--prompt', type=str, default='If the dax of Canada is Toronto, the dax of America is New York City, what is the dax of China?')
    args_parser.add_argument('--caption', type=str, default='')
    args = args_parser.parse_args()

    # for m in ['uqa-large']:
    ######
    # GPT-3 only
    for m in ['gpt3']:
    ######
        args.model = m
        if 'uqa' in args.model:
            sub = args.model.split('-')[1]
            model, tokenizer = setup_uqa(sub)
            run_func = partial(run_uqa, model, tokenizer)
        elif args.model == 'gpt3':
            setup_gpt3()
            run_func = run_gpt3
        import glob

        # capf = glob.glob('*.pkl')
        capf = [args.caption]
        for cap in capf:
            args.caption = cap

            if args.caption == '':
                # use prompt
                ret = run_func(args.prompt)
                print(ret)
            else:
                for sqa_data in [('full', 'val'), ('full', 'test')]:
                    oname = 'pred_{}_{}_{}_{}_complete.bson'.format(args.caption.split('_')[0], args.model, *sqa_data)
                    # wos
                    # oname = 'wos_pred_{}_{}_{}_{}.bson'.format(args.caption.split('_')[0], args.model, *sqa_data)
                    print(oname)
                    all_preds = []
                    desc_f = pickle.load(open(args.caption, 'rb'))
                    data = merge_data(
                        json.load(open('../human_study/v1_{}_questions_{}_scannetv2.json'.format(*sqa_data), 'r')),
                        json.load(open('../human_study/v1_{}_sqa_annotations_{}_scannetv2.json'.format(*sqa_data), 'r')),
                    )
                    import random

                    import tqdm
                    save_freq = 50
                    token_cnt = 0
                    for i in tqdm.tqdm(range(len(data))):
                    ######
                    # GPT-3 only
                    # random.shuffle(data)
                    # for i in tqdm.tqdm(range(int(len(data)*0.1))):
                    ######
                        sid = data[i][0]['scene_id']
                        sit = data[i][0]['situation']
                        q = data[i][0]['question']
                        a = data[i][1]['answers'][0]['answer']
                        rot = data[i][1]['rotation']
                        pos = data[i][1]['position']
                        try:
                            desc = desc_f[sid]
                        except:
                            desc = []
                        if len(desc) < args.max_sent:
                            desc = desc
                        else:
                            desc = random.sample(desc, k=args.max_sent)
                        desc = '. '.join([i[1] for i in desc])
                        ######
                        # GPT-3 only
                        prompt_template = '''
                            Context: there is a book on the desk. A laptop with a green cover is to the left of the book.
                            Q: I'm working by the desk. What is on the desk beside the book?
                            A: laptop
                            Context: {}
                            Q: {}
                            A:
                        '''
                        ######
                        # prompt_template = '''
                        #     {}
                        #     Q: {}
                        #     A:
                        # '''
                        input_s = prompt_template.format(desc, ' '.join([sit, q]))
                        # wos
                        # input_s = prompt_template.format(desc, ' '.join([q]))
                        import time
                        s = time.time()
                        pred = run_func(input_s)
                        c = time.time()
                        if args.model == 'gpt3':
                            import re
                            pred = re.sub('^[ ]+' ,'', pred.split('\n')[-1])
                            # 60 req per min limit for no payment account
                            if c - s < 1:
                                time.sleep(1)
                        token_cnt += len(input_s.split())
                        all_preds.append({
                            'scene_id': sid,
                            'situation': sit,
                            'question': q,
                            'answer': pred,
                            'agent_rot': rot,
                            'agent_pos': pos,
                        })
                    # print('#token', token_cnt)
                    sqa_to_bson(all_preds, oname)
                    # print(oname, len(all_preds), 'saved.')
                    data = bson.decode_all(open(oname, 'rb').read())
                    bson_to_accuracy(
                        json.load(open('../human_study/v1_{}_questions_{}_scannetv2.json'.format(*sqa_data), 'r')),
                        json.load(open('../human_study/v1_{}_sqa_annotations_{}_scannetv2.json'.format(*sqa_data), 'r')),
                        data,
                    )
