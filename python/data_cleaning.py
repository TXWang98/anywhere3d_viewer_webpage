import glob
import bson
import re
from functools import partial


def merge_alt_situations():
    import tqdm
    data = bson.decode_all(open('./data/data_s.bson', 'rb').read())
    data_rich = bson.decode_all(open('./data/data_rich_patch.bson', 'rb').read())
    count = 0
    unmatched = []
    for i in tqdm.tqdm(data_rich):
        for ind in range(len(data)):
            if data[ind]['scene_id'] == i['scene_id'] and data[ind]['agent_pos'] == i['agent_pos'] and data[ind]['agent_rot'] == i['agent_rot']:
                count += 1
                if 'alt_situation' in data[ind]:
                    data[ind]['alt_situation'].append(i['situation'])
                else:
                    data[ind]['alt_situation'] = [i['situation']]
                break
        else:
            unmatched.append(i)
    from IPython import embed; embed()
    return data

def hightlight(s, rs):
    return re.sub(rs, '['+rs+']', s)

# clean situation
def clean_all(data):
    for index in range(len(data)):
        for key in ['situation', 'question']:
            if key in data[index]:
                if not data[index][key]:
                    break
                try:
                    data[index][key] = data[index][key].lower()
                    data[index][key] = re.sub('[ ]+$' ,'', data[index][key])
                    data[index][key] = re.sub('^[ ]+' ,'', data[index][key])
                    data[index][key] = re.sub(' {2,}', ' ', data[index][key])
                    if key == 'question':
                        data[index][key] = re.sub('[^a-zA-Z0-9]+$', '', data[index][key])
                    data[index][key] = re.sub('’' ,'\'', data[index][key])
                    data[index][key] = re.sub('it[ ]*\'s' ,'it is', data[index][key])
                    data[index][key] = re.sub('he[ ]*\'s' ,'he is', data[index][key])
                    data[index][key] = re.sub('she[ ]*\'s', 'she is', data[index][key])
                    data[index][key] = re.sub('there[ ]*\'s', 'there is', data[index][key])
                    data[index][key] = re.sub('that[ ]*\'s' ,'that is', data[index][key])
                    data[index][key] = re.sub('i[ ]*\'m' ,'i am', data[index][key])
                    data[index][key] = re.sub(' \'m' ,' i am', data[index][key])
                    data[index][key] = re.sub('they[ ]*\'re' ,'they are', data[index][key])
                    data[index][key] = re.sub('there[ ]*\'re' ,'there are', data[index][key])
                    data[index][key] = re.sub('these[ ]*\'re' ,'these are', data[index][key])
                    data[index][key] = re.sub('those[ ]*\'re' ,'those are', data[index][key])
                    data[index][key] = re.sub(r'\bme left' ,'my left', data[index][key])
                    data[index][key] = re.sub(r'\bme right' ,'my right', data[index][key])
                    data[index][key] = re.sub(r'\bme back' ,'my back', data[index][key])
                    data[index][key] = re.sub(r'\bletf\b' ,'left', data[index][key])
                    data[index][key] = re.sub(r'\btehre\b' ,'there', data[index][key])
                    data[index][key] = re.sub(r'\brigth\b' ,'right', data[index][key])
                    data[index][key] = re.sub(r'\bbehine\b', 'behind', data[index][key])
                    # common grammartical error discovered by gector
                    data[index][key] = re.sub('ç' ,'c', data[index][key])
                    data[index][key] = re.sub('\?q' ,'', data[index][key])
                    data[index][key] = re.sub('\?o' ,'', data[index][key])
                    data[index][key] = re.sub('leftor' ,'left or', data[index][key])
                    data[index][key] = re.sub(r'\boclock\b' ,'o\'clock', data[index][key])
                    data[index][key] = re.sub(r'\bi\'d' ,'I\'d', data[index][key])
                    data[index][key] = re.sub(r'\bright most' ,'rightmost', data[index][key])
                    data[index][key] = re.sub(r'\bleft most' ,'leftmost', data[index][key])
                    data[index][key] = re.sub('at the left' ,'on the left', data[index][key])
                    data[index][key] = re.sub('at the right' ,'on the right', data[index][key])
                    data[index][key] = re.sub('in my left' ,'on my left', data[index][key])
                    data[index][key] = re.sub('in my right' ,'on my right', data[index][key])
                    data[index][key] = re.sub('on the bathtub' ,'in the bathtub', data[index][key])
                    data[index][key] = re.sub('working on the desk' ,'working at the desk', data[index][key])
                    data[index][key] = re.sub('eating on the table' ,'eating at the table', data[index][key])
                    data[index][key] = re.sub('working on a desk' ,'working at a desk', data[index][key])
                    data[index][key] = re.sub('eating on a table' ,'eating at a table', data[index][key])
                    data[index][key] = re.sub('at the stove' ,'on the stove', data[index][key])
                    data[index][key] = re.sub('at a stove' ,'on a stove', data[index][key])
                    data[index][key] = re.sub(r'\btv\b' ,'TV', data[index][key])
                    data[index][key] = re.sub(r'\bchai\b' ,'chair', data[index][key])
                    data[index][key] = re.sub(r'\bwasing\b' ,'washing', data[index][key])
                    data[index][key] = re.sub(r'\bwaslked\b' ,'walked', data[index][key])
                    if key == 'question':
                        data[index][key] = data[index][key] + '?'
                    # clean up redundant space between sentences
                    data[index][key] = re.sub('\.[ ]{2,}', '. ', data[index][key])
                    if key != 'answer':
                        # capitalized initial
                        data[index][key] = data[index][key][0].upper() + data[index][key][1:]
                        data[index][key] = re.sub(' i ' ,' I ', data[index][key])
                        # capitalized initial of sub-sentence
                        import string
                        for c in string.ascii_lowercase:
                            data[index][key] = re.sub(f'\. {c}', f'. {c.upper()}', data[index][key])
                except Exception as e:
                    print(e)
                    print(index, key)
                    return
    return data

# clean alt_situations
def clean_all_alt(data):
    for index in range(len(data)):
        for key in ['alt_situation']:
            if key in data[index]:
                if not data[index][key]:
                    break
                for ind in range(len(data[index][key])):
                    try:
                        data[index][key][ind] = data[index][key][ind].lower()
                        data[index][key][ind] = re.sub('[ ]+$' ,'', data[index][key][ind])
                        data[index][key][ind] = re.sub('^[ ]+' ,'', data[index][key][ind])
                        data[index][key][ind] = re.sub(' {2,}', ' ', data[index][key][ind])
                        data[index][key][ind] = re.sub('’' ,'\'', data[index][key][ind])
                        data[index][key][ind] = re.sub('it[ ]*\'s' ,'it is', data[index][key][ind])
                        data[index][key][ind] = re.sub('he[ ]*\'s' ,'he is', data[index][key][ind])
                        data[index][key][ind] = re.sub('she[ ]*\'s', 'she is', data[index][key][ind])
                        data[index][key][ind] = re.sub('there[ ]*\'s', 'there is', data[index][key][ind])
                        data[index][key][ind] = re.sub('that[ ]*\'s' ,'that is', data[index][key][ind])
                        data[index][key][ind] = re.sub('i[ ]*\'m' ,'i am', data[index][key][ind])
                        data[index][key][ind] = re.sub(' \'m' ,' i am', data[index][key][ind])
                        data[index][key][ind] = re.sub('they[ ]*\'re' ,'they are', data[index][key][ind])
                        data[index][key][ind] = re.sub('there[ ]*\'re' ,'there are', data[index][key][ind])
                        data[index][key][ind] = re.sub('these[ ]*\'re' ,'these are', data[index][key][ind])
                        data[index][key][ind] = re.sub('those[ ]*\'re' ,'those are', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bme left' ,'my left', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bme right' ,'my right', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bme back' ,'my back', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bletf\b' ,'left', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\btehre\b' ,'there', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\brigth\b' ,'right', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bbehine\b', 'behind', data[index][key][ind])
                        # common grammartical error discovered by gector
                        data[index][key][ind] = re.sub('ç' ,'c', data[index][key][ind])
                        data[index][key][ind] = re.sub('\?q' ,'', data[index][key][ind])
                        data[index][key][ind] = re.sub('\?o' ,'', data[index][key][ind])
                        data[index][key][ind] = re.sub('leftor' ,'left or', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\boclock\b' ,'o\'clock', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bi\'d' ,'I\'d', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bright most' ,'rightmost', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bleft most' ,'leftmost', data[index][key][ind])
                        data[index][key][ind] = re.sub('at the left' ,'on the left', data[index][key][ind])
                        data[index][key][ind] = re.sub('at the right' ,'on the right', data[index][key][ind])
                        data[index][key][ind] = re.sub('in my left' ,'on my left', data[index][key][ind])
                        data[index][key][ind] = re.sub('in my right' ,'on my right', data[index][key][ind])
                        data[index][key][ind] = re.sub('on the bathtub' ,'in the bathtub', data[index][key][ind])
                        data[index][key][ind] = re.sub('working on the desk' ,'working at the desk', data[index][key][ind])
                        data[index][key][ind] = re.sub('eating on the table' ,'eating at the table', data[index][key][ind])
                        data[index][key][ind] = re.sub('working on a desk' ,'working at a desk', data[index][key][ind])
                        data[index][key][ind] = re.sub('eating on a table' ,'eating at a table', data[index][key][ind])
                        data[index][key][ind] = re.sub('at the stove' ,'on the stove', data[index][key][ind])
                        data[index][key][ind] = re.sub('at a stove' ,'on a stove', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\btv\b' ,'TV', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bchai\b' ,'chair', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bwasing\b' ,'washing', data[index][key][ind])
                        data[index][key][ind] = re.sub(r'\bwaslked\b' ,'walked', data[index][key][ind])
                        if key == 'question':
                            data[index][key][ind] = re.sub('[^a-zA-Z0-9]+$', '', data[index][key][ind])
                            data[index][key][ind] = data[index][key][ind] + '?'
                        # capitalized initial
                        data[index][key][ind] = data[index][key][ind][0].upper() + data[index][key][ind][1:]
                        data[index][key][ind] = re.sub(' i ' ,' I ', data[index][key][ind])
                        # clean up redundant space between sentences
                        data[index][key][ind] = re.sub('\.[ ]{2,}', '. ', data[index][key][ind])
                        # capitalized initial of sub-sentence
                        import string
                        for c in string.ascii_lowercase:
                            data[index][key][ind] = re.sub(f'\. {c}', f'. {c.upper()}', data[index][key][ind])
                    except Exception as e:
                        print(e)
                        print(index, key)
                        return
    return data

# reversely loop up the questions given an answer
def find_q(a, data):
    ret = []
    for i in data:
        if i['answer'] == a:
            ret.append(i['question'])
            print(ret[0])
    return ret

# summarize the answer distribution
def digest_answer(data):
    a = {}
    for i in data:
        if i['answer'] in a:
            a[i['answer']] += 1
        else:
            a[i['answer']] = 1
    cnt = 0
    for k, v in a.items():
        if v == 1:
            cnt += 1
    a = list(a.items())
    a.sort(key=lambda x: x[1], reverse=True)
    from pprint import pprint
    pprint(a)
    print(f'Total: {len(a)}; solo answer: {cnt}')
    return a

# clean answer
def clean_answer(data):
    key = 'answer'
    # with open('a_orig.txt', 'w') as f:
    #     for i in data:
    #         f.write(i['answer'].lower()+'\n')
    for index in range(len(data)):
        data[index][key] = data[index][key].lower()
        data[index][key] = re.sub('[ ]+$' ,'', data[index][key])
        data[index][key] = re.sub('^[ ]+' ,'', data[index][key])
        data[index][key] = re.sub(' {2,}', ' ', data[index][key])

        data[index][key] = re.sub('\.[ ]{2,}', '. ', data[index][key])
        data[index][key] = re.sub('[^a-zA-Z0-9,\'\s\-:]+', '', data[index][key])
        data[index][key] = re.sub('ç' ,'c', data[index][key])
        data[index][key] = re.sub('’' ,'\'', data[index][key])
        data[index][key] = re.sub(r'\bletf\b' ,'left', data[index][key])
        data[index][key] = re.sub(r'\blet\b' ,'left', data[index][key])
        data[index][key] = re.sub(r'\btehre\b' ,'there', data[index][key])
        data[index][key] = re.sub(r'\brigth\b' ,'right', data[index][key])
        data[index][key] = re.sub(r'\brght\b' ,'right', data[index][key])
        data[index][key] = re.sub(r'\bbehine\b', 'behind', data[index][key])
        data[index][key] = re.sub(r'\btv\b' ,'TV', data[index][key])
        data[index][key] = re.sub(r'\bchai\b' ,'chair', data[index][key])
        data[index][key] = re.sub(r'\bwasing\b' ,'washing', data[index][key])
        data[index][key] = re.sub(r'\bwaslked\b' ,'walked', data[index][key])
        data[index][key] = re.sub(r'\boclock\b' ,'o\'clock', data[index][key])
        data[index][key] = re.sub(r'\bo\'[ ]+clock\b' ,'o\'clock', data[index][key])

        # digit to word, only for answer
        data[index][key] = re.sub(r'\b0\b', 'zero', data[index][key])
        data[index][key] = re.sub(r'\bnone\b', 'zero', data[index][key])
        data[index][key] = re.sub(r'\b1\b', 'one', data[index][key])
        data[index][key] = re.sub(r'\b2\b', 'two', data[index][key])
        data[index][key] = re.sub(r'\b3\b', 'three', data[index][key])
        data[index][key] = re.sub(r'\b4\b', 'four', data[index][key])
        data[index][key] = re.sub(r'\b5\b', 'five', data[index][key])
        data[index][key] = re.sub(r'\b6\b', 'six', data[index][key])
        data[index][key] = re.sub(r'\b7\b', 'seven', data[index][key])
        data[index][key] = re.sub(r'\b8\b', 'eight', data[index][key])
        data[index][key] = re.sub(r'\b9\b', 'nine', data[index][key])
        data[index][key] = re.sub(r'\b10\b', 'ten', data[index][key])
        data[index][key] = re.sub(r'\b11\b', 'eleven', data[index][key])
        data[index][key] = re.sub(r'\b12\b', 'twelve', data[index][key])
        data[index][key] = re.sub(r'\b13\b', 'thirteen', data[index][key])
        data[index][key] = re.sub(r'\b14\b', 'fourteen', data[index][key])
        data[index][key] = re.sub(r'\b15\b', 'fifteen', data[index][key])
        data[index][key] = re.sub(r'\b16\b', 'sixteen', data[index][key])
        data[index][key] = re.sub(r'\b17\b', 'seventeen', data[index][key])
        data[index][key] = re.sub(r'\b18\b', 'eighteen', data[index][key])
        data[index][key] = re.sub(r'\b19\b', 'nineteen', data[index][key])
        data[index][key] = re.sub(r'\b20\b', 'twenty', data[index][key])
        data[index][key] = re.sub(r'\b23\b', 'twenty-three', data[index][key])

        # misc
        # no1, mat2, etc
        data[index][key] = re.sub(r'\b([a-zA-Z]+)([0-9])\b' ,r'\g<1>', data[index][key])
        data[index][key] = re.sub(r'\ba\b ([a-zA-Z]+)' ,r'\g<1>', data[index][key])
        data[index][key] = re.sub(r'\ban\b ([a-zA-Z]+)' ,r'\g<1>', data[index][key])
        data[index][key] = re.sub(r'\bthe\b ([a-zA-Z]+)' ,r'\g<1>', data[index][key])

        data[index][key] = re.sub(r'\bbackwards\b', 'backward', data[index][key])


    # with open('a_new_basic.txt', 'w') as f:
    #     for i in data:
    #         f.write(i['answer'].lower()+'\n')


    # for index in range(len(data)):
    #     # advanced
    #     # on my xxx o'clock -> xxx o'clock
    #     if 'o\'clock' in data[index][key] and len(data[index][key].split()) > 2:
    #         data[index][key] = ' '.join(data[index][key].split()[-2:])
    #     # yes/no, xxx
    #     if re.findall(r'\byes\b', data[index][key]) and len(data[index][key]) > 3:
    #         data[index][key] = 'yes'
    #     if re.findall(r'\bno\b', data[index][key]) and len(data[index][key]) > 2:
    #         data[index][key] = 'no'
    #     # three o'clock -> right
    #     if not re.findall(r'\bor\b', data[index]['question']):
    #         data[index][key] = re.sub(r'\bnine o\'clock\b' ,r'left', data[index][key])
    #         data[index][key] = re.sub(r'\bthree o\'clock\b' ,r'right', data[index][key])
    #         data[index][key] = re.sub(r'\btwelve o\'clock\b' ,r'front', data[index][key])
    #         data[index][key] = re.sub(r'\btsix o\'clock\b' ,r'back', data[index][key])
    #     # my left -> left
    #     l = ['to the left', 'to my left', 'left side', ]
    #     for il in l:
    #         if re.findall(il, data[index][key]):
    #             data[index][key] = 'left'
    #     l = ['the right', 'my right', 'right side', ]
    #     for il in l:
    #         if re.findall(il, data[index][key]):
    #             data[index][key] = 'right'
    #     l = ['in front', 'infront', 'my front', ]
    #     for il in l:
    #         if re.findall(il, data[index][key]):
    #             data[index][key] = 'front'
    #     l = ['my back', 'backside', 'the back']
    #     for il in l:
    #         if re.findall(il, data[index][key]):
    #             data[index][key] = 'back'

    # with open('a_new_advanced.txt', 'w') as f:
    #     for i in data:
    #         f.write(i['answer'].lower()+'\n')

    return data

# reject certain type of gec
def reject_diff(s_orig, s_new):
    import difflib
    diff = difflib.Differ()
    tmp = list(diff.compare(s_orig, s_new))
    res = []
    for i in tmp:
        if len(i.split()) == 2:
            res.append(''.join(i.split()))
        elif len(i.split()) == 0:
            res.append(' ')
        elif len(i.split()) == 1:
            res.append(i.split()[0])
        else:
            assert False
    res = ''.join(res)
    reject_pattern = [
        '-l-e-f+r+i+g+ht',
        '+l+e+f-r-i-g-ht',
        '-i-m-m-e-d-i-a-t-e-l-y',
        '-i-m-m-e-d-i-a-t-e-',
        '-d-i-r-e-c-t-l-y',
        '-m-o-s-t',
        '-m-o-st',
    ]
    for r in reject_pattern:
        if r in res:
            return s_orig
    else:
        return s_new

# gec for situation, question, answer and alternative situation
def gec_step1():
    #### intial regex
    ds = bson.decode_all(open('./data/data_s.bson', 'rb').read())
    dqa = bson.decode_all(open('./data/data_qa.bson', 'rb').read())
    ret_ds = clean_all_alt(clean_all(ds))
    ret_dqa = clean_all_alt(clean_all(dqa))
    with open('ds.txt', 'w') as f:
        for idx1, i in enumerate(ret_ds):
            f.write(f'{idx1}#s' + ' => ' + i['situation']+'\n')
            for idx2, j in enumerate(i['alt_situation']):
                f.write(f'{idx1}#{idx2}#alts'+ ' => ' + j +'\n')
    with open('dqa.txt', 'w') as f:
        for idx1, i in enumerate(ret_dqa):
            f.write(f'{idx1}#s' + ' => ' + i['situation']+'\n')
            f.write(f'{idx1}#qa' + ' => ' + i['question']+'\n')
            for idx2, j in enumerate(i['alt_situation']):
                f.write(f'{idx1}#{idx2}#alts'+ ' => ' + j +'\n')

def gec_step2():
    # gector autoGEC
    print("""
    #! cd <gector_repo>
    #! python predict.py --model_path ~/Downloads/roberta_1_gectorv2.th  --input_file ~/workspace/sqaUI/sqa3d_data/alts1.txt --vocab_path data/output_vocabulary --output_file out.txt --batch_size 256
    #! cp final-ds-out.txt ../sqa3d_data/ds_gector.txt
    #! cp final-dqa-out.txt ../sqa3d_data/dqa_gector.txt
    """)

def gec_step3():
    # final regex, answer cleaning and viz
    with open('./dqa_gector.txt', 'r') as f:
        f = f.read().split('\n')[:-1]
        for i in f:
            tmp = i.split(' => ')
            text = tmp[1]
            meta = tmp[0]
            idx1 = int(meta.split('#')[0])
            cat = meta.split('#')[-1]
            if cat == 'alts':
                idx2 = int(meta.split('#')[1])
                ret_dqa[idx1]['alt_situation'][idx2] = reject_diff(ret_dqa[idx1]['alt_situation'][idx2], text)
            elif cat == 's':
                ret_dqa[idx1]['situation'] = reject_diff(ret_dqa[idx1]['situation'], text)
            elif cat == 'qa':
                ret_dqa[idx1]['question'] = reject_diff(ret_dqa[idx1]['question'], text)
            else:
                assert False
    with open('./ds_gector.txt', 'r') as f:
        f = f.read().split('\n')[:-1]
        for i in f:
            tmp = i.split(' => ')
            text = tmp[1]
            meta = tmp[0]
            idx1 = int(meta.split('#')[0])
            cat = meta.split('#')[-1]
            if cat == 'alts':
                idx2 = int(meta.split('#')[1])
                ret_ds[idx1]['alt_situation'][idx2] = reject_diff(ret_ds[idx1]['alt_situation'][idx2], text)
            elif cat == 's':
                ret_ds[idx1]['situation'] = reject_diff(ret_ds[idx1]['situation'], text)
            elif cat == 'qa':
                ret_ds[idx1]['question'] = reject_diff(ret_ds[idx1]['question'], text)
            else:
                assert False

    ret_ds = clean_all_alt(clean_all(ret_ds))
    ret_dqa = clean_answer(clean_all_alt(clean_all(ret_dqa)))
    with open('./data/data_s_gec.bson', 'wb') as f:
        for i in ret_ds:
            f.write(bson.encode(i))
    with open('./data/data_qa_gec.bson', 'wb') as f:
        for i in ret_dqa:
            f.write(bson.encode(i))

    # data viz
    ds = bson.decode_all(open('./data/data_s.bson', 'rb').read())
    dqa = bson.decode_all(open('./data/data_qa.bson', 'rb').read())
    import random
    # random.shuffle(ds)
    # random.shuffle(dqa)
    with open('s_orig.txt', 'w') as f:
        for i in ds:
            f.write(i['situation']+'\n')
    with open('q_orig.txt', 'w') as f:
        for i in dqa:
            f.write(i['question']+'\n')
    with open('a_orig.txt', 'w') as f:
        for i in dqa:
            f.write(i['answer']+'\n')
    with open('alts_orig.txt', 'w') as f:
        for i in ds:
            for j in i['alt_situation']:
                f.write(j+'\n')

    ds_gec = bson.decode_all(open('./data/data_s_gec.bson', 'rb').read())
    dqa_gec = bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read())
    # random.shuffle(ds_gec)
    # random.shuffle(dqa_gec)
    with open('s_gec.txt', 'w') as f:
        for i in ds_gec:
            f.write(i['situation']+'\n')
    with open('q_gec.txt', 'w') as f:
        for i in dqa_gec:
            f.write(i['question']+'\n')
    with open('a_gec.txt', 'w') as f:
        for i in dqa_gec:
            f.write(i['answer']+'\n')
    with open('alts_gec.txt', 'w') as f:
        for i in ds_gec:
            for j in i['alt_situation']:
                f.write(j+'\n')

    # answer viz
    return digest_answer(ret_dqa)

# answer dict
def save_answer_dict():
    # by default, we simply drop all answers that only appear once
    dqa = bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read())
    answers = digest_answer(dqa)
    final_answers = []
    for i in answers:
        if i[1] > 1:
            final_answers.append(i[0])
    import random
    random.shuffle(final_answers)
    d1, d2 = {}, {}
    for ind, a in enumerate(final_answers):
        d1[a] = ind
        d2[ind] = a
    json.dump([d1, d2], open('answer_dict.json', 'w'))
    print('Topk answer: {}; Total answer: {}'.format(len(answers), len(d1)))

# dataset balancing
def get_prefix_answer_dist():
    ret_dqa = bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read())

    prefix = {}
    answer = []
    for i in ret_dqa:
        q = i['question']
        prefix1 = q.split()[0]
        prefix2 = ' '.join(q.split()[:2])
        answer.append(i['answer'])
        if prefix1 in prefix:
            prefix[prefix1] += 1
        else:
            prefix[prefix1] = 1
        if prefix2 in prefix:
            prefix[prefix2] += 1
        else:
            prefix[prefix2] = 1
    prefix = list(prefix.items())
    prefix.sort(key=lambda x: x[1])
    return prefix

def balance_answer_ngrams(ngram=3):
    import json
    import bson
    import numpy as np
    import tqdm
    import scipy
    import re
    import random
    from pprint import pprint
    ############ balance
    dqa = bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read())
    mapping = json.load(open('./answer_dict.json', 'r'))[0]
    answer_list = list(mapping.keys()) + ['other']

    # # test augment
    # aug_dqa = []
    # for d in dqa[:int(len(dqa)*0.8)]:
    #     aug_dqa.append({
    #         'question': d['question'],
    #         'answer': random.sample(answer_list[:-1], k=1)[0]
    #     })
    # dqa.extend(aug_dqa)

    # tactic 1: if top two > 50%, their diff shall less than 10%
    top2_thesh = 0.5
    top2_diff = 0.1

    answer_list = list(mapping.keys()) + ['other']
    vocab = {}
    vocab_answer = {}
    dqa_ngrams = []
    for d in tqdm.tqdm(dqa):
        ngrams = []
        #################
        # text = ' '.join([d['situation'], d['question']])
        text = d['question']
        # text = d['situation']
        #################
        ans = d['answer']
        text = text.lower().replace(',', '').replace('.', '').replace('?', '').replace('\'s', ' \'s')
        ws = text.split(' ')
        if len(ws) <= ngram:
            k = ' '.join(ws)
            if not k in vocab:
                vocab[k] = 1
                vocab_answer[k] = [ans]
            else:
                vocab[k] = vocab[k] + 1
                vocab_answer[k].append(ans)
            ngrams.append(k)
        else:
            for i in range(len(ws)-ngram+1):
                k = ' '.join(ws[i:i+ngram])
                if not k in vocab:
                    vocab[k] = 1
                    vocab_answer[k] = [ans]
                else:
                    vocab[k] = vocab[k] + 1
                    vocab_answer[k].append(ans)
                ngrams.append(k)
        dqa_ngrams.append(ngrams)
    vocab_weight = {k: v/len(dqa) for k, v in vocab.items()}
    vocab_answer_dist = {k: {a: 0 for a in answer_list} for k in vocab.keys()}
    for k, v in vocab_answer.items():
        total = 0
        for ans in v:
            if ans in answer_list:
                vocab_answer_dist[k][ans] += 1
            else:
                vocab_answer_dist[k]['other'] += 1
        vocab_answer_dist[k] = {i: j/len(v) for i, j in vocab_answer_dist[k].items()}
        import pytest
        assert sum(vocab_answer_dist[k].values()) == pytest.approx(1.0)

    # categorize Q based on ngrams
    dqa_ngram_selected = []
    ngram_selected_answer_count = {}
    cnt = 0
    for ngrams, d in zip(dqa_ngrams, dqa):
        # # tactic 1: select the most-frequent ngram
        # weights = [vocab_weight[g] for g in ngrams]
        # selected = ngrams[np.argmax(weights)]

        # tactic 2: select the most-frequent ngram among those contribute to the right answer
        def guess(ans_dist):
            # return np.random.choice(a=answer_list, p=[w for w in ans_dist.values()], size=1)[0]
            return answer_list[np.argmax(list(ans_dist.values()))]
        ngrams_new = []
        gt_ans = d['answer'] if d['answer'] in answer_list[:-1] else 'other'
        for g in ngrams:
            if guess(vocab_answer_dist[g]) == gt_ans:
                ngrams_new.append(g)
        if len(ngrams_new) == 0:
            ngrams_new = ngrams
            cnt += 1
        weights = [vocab_weight[g] for g in ngrams_new]
        selected = ngrams_new[np.argmax(weights)]

        dqa_ngram_selected.append(selected)
        if selected in ngram_selected_answer_count:
            ngram_selected_answer_count[selected][gt_ans] += 1
        else:
            ngram_selected_answer_count[selected] = {ans: 0 for ans in answer_list}
            ngram_selected_answer_count[selected][gt_ans] += 1

    assert len(dqa_ngram_selected) == len(dqa)
    print('ngrams in {}/{} sqas fail to contribute to any correct answer'.format(cnt, len(dqa)))

    # calculate balance amount
    balance_amount = []
    cnt = 0
    for k, v in ngram_selected_answer_count.items():
        # tactic 1: if top two > 50%, their diff shall less than 10%
        total = sum(v.values())
        _tmp = np.argsort(list(v.values()))[::-1]
        top1 = list(v.keys())[_tmp[0]]
        top2 = list(v.keys())[_tmp[1]]
        top3 = list(v.keys())[_tmp[2]]
        if top1 == 'other':
            top1, top2 = top2, top3
        if top2 == 'other':
            top1, top2 = top1, top3
        assert top1 != 'other'
        assert top2 != 'other'
        if v[top1]+v[top2] < total * top2_thesh:
            continue
        if v[top1] - v[top2] < total * top2_diff:
            continue
        balance_amount.append((k, top1, v[top1] - v[top2], (v[top1] - v[top2])/total))

    balance_amount.sort(key=lambda x: x[-1], reverse=True)
    pprint(balance_amount[:50][::-1])
    print('===========================')
    balance_amount.sort(key=lambda x: x[-2], reverse=True)
    pprint(balance_amount[:50][::-1])
    # from IPython import embed; embed()
    balance_amount_filtered = []
    for i in balance_amount:
        #####################################################
        # only keep those with diff >= 3
        # if i[-2] > 5 or (i[-1] != 1 and i[-1] > 0.2):
        balance_amount_filtered.append(i)
        #####################################################

    from IPython import embed; embed()

    print('Before balance, #dqa:{}'.format(len(dqa)))
    import copy
    new_dqa = copy.deepcopy(dqa)
    new_dqa_ngram_selected = copy.deepcopy(dqa_ngram_selected)
    for (k, a, diff, _) in tqdm.tqdm(balance_amount_filtered):
        index = []
        for ind in range(len(new_dqa)):
            answer = new_dqa[ind]['answer']
            if answer == a and new_dqa_ngram_selected[ind] == k:
                index.append(ind)
        rmv_index = random.sample(index, k=int(diff))
        tmp = []
        tmp2 = []
        for ind in range(len(new_dqa)):
            if ind not in rmv_index:
                tmp.append(new_dqa[ind])
                tmp2.append(new_dqa_ngram_selected[ind])
        new_dqa = tmp
        new_dqa_ngram_selected = tmp2

    print('After balance, #dqa:{}'.format(len(new_dqa)))
    with open('./data/data_qa_gec_balanced_ngrams_new.bson', 'wb') as f:
        for i in new_dqa:
            f.write(bson.encode(i))
    print('Done.')
    ############ balance

def balance_answer(prefix):
    ############ balance
    dqa = bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read())
    # balance 1
    diff_threshold = 0.1
    top2_ratio = 0.5
    # balance 2
    threshold = 0.2

    prefix = [
    ('Which is', 125),
    ('Do', 127),
    ('What type', 133),
    ('How do', 133),
    ('Which side', 143),
    ('Which object', 147),
    ('What direction', 193),
    ('What can', 216),
    ('What object', 220),
    ('How should', 228),
    ('Which one', 244),
    ('Which way', 352),
    ('Does', 376),
    ('What shape', 385),
    ('Am', 711),
    ('Where', 796),
    ('If', 994),
    ('Are', 1148),
    ('Is there', 1195),
    ('Which direction', 1683),
    ('What color', 1920),
    ('Can', 2508+593),
    ('How many', 4525),
    ('Is the', 5351),
    ('What is', 5942),
    ]
    prefix = [i[0] for i in prefix]

    import re
    prefix_a = {i:[] for i in prefix}
    for i in dqa:
        q = i['question']
        a = i['answer']
        for p in prefix:
            if re.findall(r'^{}\b'.format(p), q):
                prefix_a[p].append(a)
                break
    prefix_data = {}
    for p, alist in prefix_a.items():
        cnt = len(alist)
        a_d = {}
        for a in alist:
            if a in a_d:
                a_d[a] += 1
            else:
                a_d[a] = 1
        a_d = [(k, v/cnt) for k, v in a_d.items()]
        a_d.sort(key=lambda x: x[1], reverse=True)
        prefix_data[p] = a_d

    # balance 2: no category shall exceed threshold
    need_balance = []
    for i in prefix:
        if i.split()[0].lower() not in [
            'do', 'does', 'am', 'are', 'is', 'can'
        ]:
            total = len(prefix_a[i])
            tmp = []
            for cat in prefix_data[i]:
                # print(total, cat[1])
                if cat[1] > threshold:
                    tmp.append(cat)
            a = np.ones((len(tmp), len(tmp))) * threshold - np.eye(len(tmp))
            b = np.array([(threshold-k[1])*total for k in tmp])
            sol = np.linalg.solve(a, b)
            for ans, adjust in zip(tmp, sol):
                need_balance.append((i, ans[0], adjust))
    print(need_balance)

    print('Before balance, #dqa:{}'.format(len(dqa)))
    import copy
    new_dqa = copy.deepcopy(dqa)
    for i in need_balance:
        p, ans, cnt = i
        index = []
        for ind in range(len(new_dqa)):
            d = new_dqa[ind]
            if re.findall(r'^{}\b'.format(p), d['question']) and d['answer'] == ans:
                index.append(ind)
        rmv_index = random.sample(index, k=int(cnt))
        tmp = []
        for ind in range(len(new_dqa)):
            if ind not in rmv_index:
                tmp.append(new_dqa[ind])
        new_dqa = tmp

    print('After balance 2, #dqa:{}'.format(len(new_dqa)))

    # balance 1: top 2 categories need to be equal
    import re
    prefix_a = {i:[] for i in prefix}
    for i in new_dqa:
        q = i['question']
        a = i['answer']
        for p in prefix:
            if re.findall(r'^{}\b'.format(p), q):
                prefix_a[p].append(a)
                break
    prefix_data = {}
    for p, alist in prefix_a.items():
        cnt = len(alist)
        a_d = {}
        for a in alist:
            if a in a_d:
                a_d[a] += 1
            else:
                a_d[a] = 1
        a_d = [(k, v/cnt) for k, v in a_d.items()]
        a_d.sort(key=lambda x: x[1], reverse=True)
        prefix_data[p] = a_d
    need_balance = []
    for i in prefix:
        top1 = prefix_data[i][0]
        top2 = prefix_data[i][1]
        total = len(prefix_a[i])
        diff = top1[1]-top2[1]
        if (top1[1]+top2[1]) >= top2_ratio and diff > diff_threshold:
            need_balance.append((i, top1[0], diff*total))
    print(need_balance)

    import copy
    new_dqa = copy.deepcopy(new_dqa)
    for i in need_balance:
        p, ans, cnt = i
        index = []
        for ind in range(len(new_dqa)):
            d = new_dqa[ind]
            if re.findall(r'^{}\b'.format(p), d['question']) and d['answer'] == ans:
                index.append(ind)
        rmv_index = random.sample(index, k=int(cnt))
        tmp = []
        for ind in range(len(new_dqa)):
            if ind not in rmv_index:
                tmp.append(new_dqa[ind])
        new_dqa = tmp

    print('After balance 1, #dqa:{}'.format(len(new_dqa)))
    print('Started regression test...')
    # # regression test
    # import re
    # prefix_a = {i:[] for i in prefix}
    # for i in new_dqa:
    #     q = i['question']
    #     a = i['answer']
    #     for p in prefix:
    #         if re.findall(r'^{}\b'.format(p), q):
    #             prefix_a[p].append(a)
    #             break
    # prefix_data = {}
    # for p, alist in prefix_a.items():
    #     cnt = len(alist)
    #     a_d = {}
    #     for a in alist:
    #         if a in a_d:
    #             a_d[a] += 1
    #         else:
    #             a_d[a] = 1
    #     a_d = [(k, v/cnt) for k, v in a_d.items()]
    #     a_d.sort(key=lambda x: x[1], reverse=True)
    #     prefix_data[p] = a_d

    # # # balance 1
    # # need_balance = []
    # # for i in prefix:
    # #     top1 = prefix_data[i][0]
    # #     top2 = prefix_data[i][1]
    # #     total = len(prefix_a[i])
    # #     diff = top1[1]-top2[1]
    # #     if (top1[1]+top2[1]) >= top2_ratio and diff > diff_threshold:
    # #         need_balance.append((i, top1, diff*total))
    # # assert need_balance == []

    # # balance 2: no category shall exceed threshold
    # need_balance = []
    # for i in prefix:
    #     if i.split()[0].lower() not in [
    #         'do', 'does', 'am', 'are', 'is', 'can'
    #     ]:
    #         total = len(prefix_a[i])
    #         for cat in prefix_data[i]:
    #             if cat[1] > threshold:
    #                 need_balance.append((i, cat[0], total*(cat[1]-threshold)))

    with open('./data/data_qa_gec_balanced_new.bson', 'wb') as f:
        for i in new_dqa:
            f.write(bson.encode(i))
    print('Done.')
    ############ balance

# create split
def create_split(regression_test=True):
    ############ dataset split
    import json
    import bson
    import random
    import datetime
    import hashlib
    split_file = json.load(open('./scene_split.json', 'r'))

    base_path = './release_checked/'
    # tags = ['full', 'balanced', 'balanced_new']
    tags = ['ngrams_new']
    dqas = [
        # bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read()),
        # bson.decode_all(open('./data/data_qa_gec_balanced.bson', 'rb').read()),
        # bson.decode_all(open('./data/data_qa_gec_balanced_new.bson', 'rb').read()),
        bson.decode_all(open('./data/data_qa_gec_balanced_ngrams_new.bson', 'rb').read())
    ]

    for tag, dqa in zip(tags, dqas):
        ans_list = list(json.load(open('./answer_dict.json', 'r'))[0].keys())

        random.shuffle(dqa)
        now = datetime.datetime.now()
        time = now.strftime("%Y-%m-%d %H:%M:%S")
        URL = 'bigai.github.io/sqa3d'
        shared = {
            'info': {
                'description': 'This is v1.0 of the SQA3D dataset.',
                'url': URL,
                'version': '1.0',
                'year': now.year,
                'contributor': 'SQA3D Team',
                'date_created': time,
                },
            'license': {
                'url': 'http://creativecommons.org/licenses/by/4.0/',
                'name': 'Creative Commons Attribution 4.0 International License'
                },
            'data_type': 'scannet',
            'data_subtype': 'v2',
        }

        import copy
        situations = copy.deepcopy(shared)
        situations['task_type'] = 'Semantic localization'
        situations['situations'] = []

        locations = copy.deepcopy(shared)
        locations['annotations'] = []

        questions = copy.deepcopy(shared)
        questions['task_type'] = 'Situated question answering'
        questions['questions'] = []

        answers = copy.deepcopy(shared)
        answers['annotations'] = []

        uuid_s_base = 220601000000
        s_lookup = {}
        for d in dqa:
            s = d['situation']
            scene = d['scene_id']
            pos = d['agent_pos']
            rot = d['agent_rot']
            alt = d['alt_situation']

            hashid = hashlib.md5(json.dumps([s, scene, pos, rot]).encode()).hexdigest()
            if hashid not in s_lookup:
                s_lookup[hashid] = uuid_s_base
                s_instance = {
                    'scene_id': scene,
                    'situation': s,
                    'situation_id': uuid_s_base,
                    'augmented': False
                }
                situations['situations'].append(s_instance)
                l_instance = {
                    'scene_id': scene,
                    'situation_id': uuid_s_base,
                    'position': pos,
                    'rotation': rot,
                }
                locations['annotations'].append(l_instance)
                uuid_s_base += 1
            # alts
            for alts in alt:
                hashid = hashlib.md5(json.dumps([alts, scene, pos, rot]).encode()).hexdigest()
                if hashid not in s_lookup:
                    s_lookup[hashid] = uuid_s_base
                    s_instance = {
                        'scene_id': scene,
                        'situation': alts,
                        'situation_id': uuid_s_base,
                        'augmented': True
                    }
                    situations['situations'].append(s_instance)
                    l_instance = {
                        'scene_id': scene,
                        'situation_id': uuid_s_base,
                        'position': pos,
                        'rotation': rot,
                    }
                    locations['annotations'].append(l_instance)
                    uuid_s_base += 1

        uuid_q_base = 220602000000
        for d in dqa:
            s = d['situation']
            scene = d['scene_id']
            q = d['question']
            a = d['answer']
            pos = d['agent_pos']
            rot = d['agent_rot']
            alt = d['alt_situation']

            q_instance = {
                'scene_id': scene,
                'situation': s,
                'alternative_situation': alt,
                'question': q,
                'question_id': uuid_q_base,
            }
            questions['questions'].append(q_instance)
            a_instance = {
                'scene_id': scene,
                'question_type': 'N/A',
                'answer_type': 'other',
                'question_id': uuid_q_base,
                'answers': [
                    {'answer': a, 'answer_confidence': 'yes', 'answer_id': 1}
                ],
                'rotation': rot,
                'position': pos,
            }
            answers['annotations'].append(a_instance)
            uuid_q_base += 1


        for split, list_sid in split_file.items():
            s = copy.deepcopy(situations)
            l = copy.deepcopy(locations)
            q = copy.deepcopy(questions)
            a = copy.deepcopy(answers)

            all_q = []
            all_s = []
            all_alts = []
            all_scene = []
            cnt_answerable_q = 0

            new_instances = []
            for ind in range(len(s['situations'])):
                if s['situations'][ind]['scene_id'] in list_sid:
                    new_instances.append(s['situations'][ind])
                    if s['situations'][ind]['augmented']:
                        all_alts.append(s['situations'][ind]['situation'])
                    else:
                        all_s.append(s['situations'][ind]['situation'])
            s['situations'] = new_instances

            new_instances = []
            for ind in range(len(l['annotations'])):
                if l['annotations'][ind]['scene_id'] in list_sid:
                    new_instances.append(l['annotations'][ind])
            l['annotations'] = new_instances

            new_instances = []
            for ind in range(len(q['questions'])):
                if q['questions'][ind]['scene_id'] in list_sid:
                    new_instances.append(q['questions'][ind])
                    all_scene.append(q['questions'][ind]['scene_id'])
                    all_q.append(q['questions'][ind]['question'])
            q['questions'] = new_instances

            new_instances = []
            for ind in range(len(a['annotations'])):
                if a['annotations'][ind]['scene_id'] in list_sid:
                    new_instances.append(a['annotations'][ind])
                    if a['annotations'][ind]['answers'][0]['answer'] in ans_list:
                        cnt_answerable_q += 1
            a['annotations'] = new_instances

            import os
            import os.path as osp
            os.makedirs(osp.join(base_path, 'localization_task'), exist_ok=True)
            os.makedirs(osp.join(base_path, 'sqa_task', tag), exist_ok=True)
            import shutil
            shutil.copy('./answer_dict.json', osp.join(base_path, 'sqa_task'))
            shutil.copy('./scene_split.json', base_path)

            json.dump(s, open(osp.join(base_path, 'localization_task', f'v1_situations_{split}_scannetv2.json'), 'w'))
            json.dump(l, open(osp.join(base_path, 'localization_task', f'v1_localization_annotations_{split}_scannetv2.json'), 'w'))
            json.dump(q, open(osp.join(base_path, 'sqa_task', tag, f'v1_{tag}_questions_{split}_scannetv2.json'), 'w'))
            json.dump(a, open(osp.join(base_path, 'sqa_task', tag, f'v1_{tag}_sqa_annotations_{split}_scannetv2.json'), 'w'))

            assert len(s['situations']) == len(l['annotations'])
            assert len(q['questions']) == len(a['annotations'])

            cnt_s = len(all_s)
            cnt_alts = len(all_alts)
            assert cnt_s + cnt_alts == len(s['situations'])
            cnt_q = len(all_q)
            assert cnt_q == len(q['questions'])
            cnt_unique_s = len(set(all_s))
            cnt_unique_alts = len(set(all_alts))
            cnt_unique_q = len(set(all_q))
            cnt_scene = len(set(all_scene))

            print(f'Split: {split}; #scene: {cnt_scene}; #s: {cnt_s}; #u_s: {cnt_unique_s}; #alts: {cnt_alts}; #u_alts: {cnt_unique_alts}; #q: {cnt_q}; #unique_q: {cnt_unique_q}; #answerable_q: {cnt_answerable_q}')

            if regression_test:
                ### regression test
                print('Start regression test...')
                s = json.load(open(osp.join(base_path, 'localization_task', f'v1_situations_{split}_scannetv2.json'), 'r'))
                l = json.load(open(osp.join(base_path, 'localization_task', f'v1_localization_annotations_{split}_scannetv2.json'), 'r'))
                q = json.load(open(osp.join(base_path, 'sqa_task', tag, f'v1_{tag}_questions_{split}_scannetv2.json'), 'r'))
                a = json.load(open(osp.join(base_path, 'sqa_task', tag, f'v1_{tag}_sqa_annotations_{split}_scannetv2.json'), 'r'))

                import tqdm
                def find_item(bson_data, s, scene, pos, rot, q=None, a=None, alts=None, augmented=False):
                    for d in bson_data:
                        c1 = scene == d['scene_id']
                        if augmented:
                            c2 = s in d['alt_situation']
                        else:
                            c2 = s == d['situation']
                        c3 = pos == d['agent_pos']
                        c4 = rot == d['agent_rot']
                        if q:
                            assert a is not None
                            assert alts is not None
                            c5 = q == d['question']
                            c6 = a == d['answer']
                            c7 = repr(alts) == repr(d['alt_situation'])
                            if c1 == c2 == c3 == c4 == c5 == c6 == c7 == True:
                                break
                        else:
                            if c1 == c2 == c3 == c4 == True:
                                break
                    else:
                        return False
                    return True

                # build index
                print('Building index...')
                index = {}
                for i in tqdm.tqdm(s['situations']):
                    sid = i['situation_id']
                    for j in range(len(l['annotations'])):
                        if l['annotations'][j]['situation_id'] == sid:
                            index[sid] = j
                            break
                    else:
                        assert False

                for i in tqdm.tqdm(s['situations']):
                    _sid = i['situation_id']
                    _s = i['situation']
                    _scene = i['scene_id']
                    _augmented = i['augmented']
                    _pos = l['annotations'][index[_sid]]['position']
                    _rot = l['annotations'][index[_sid]]['rotation']
                    assert find_item(dqa, _s, _scene, _pos, _rot, augmented=_augmented)

                print('Building index...')
                index = {}
                for i in tqdm.tqdm(q['questions']):
                    sid = i['question_id']
                    for j in range(len(a['annotations'])):
                        if a['annotations'][j]['question_id'] == sid:
                            index[sid] = j
                            break
                    else:
                        assert False

                for i in q['questions']:
                    _sid = i['question_id']
                    _a = a['annotations'][index[_sid]]['answers'][0]['answer']

                for i in tqdm.tqdm(q['questions']):
                    _sid = i['question_id']
                    _s = i['situation']
                    _scene = i['scene_id']
                    _q = i['question']
                    _alts = i['alternative_situation']
                    _pos = a['annotations'][index[_sid]]['position']
                    _rot = a['annotations'][index[_sid]]['rotation']
                    _a = a['annotations'][index[_sid]]['answers'][0]['answer']
                    assert find_item(dqa, _s, _scene, _pos, _rot, q=_q, a=_a, alts=_alts)

    ############ dataset split

def get_prefix(dqa):
    # prefix = {}
    # answer = []
    # for i in dqa:
    #     q = i['question']
    #     prefix1 = q.split()[0]
    #     prefix2 = ' '.join(q.split()[:2])
    #     answer.append(i['answer'])
    #     if prefix1 in prefix:
    #         prefix[prefix1] += 1
    #     else:
    #         prefix[prefix1] = 1
    #     if prefix2 in prefix:
    #         prefix[prefix2] += 1
    #     else:
    #         prefix[prefix2] = 1
    # prefix = list(prefix.items())
    # prefix.sort(key=lambda x: x[1])
    # return [p[0] for p in prefix]


    prefix = [
    ('Which is', 125),
    ('Do', 127),
    ('What type', 133),
    ('How do', 133),
    ('Which side', 143),
    ('Which object', 147),
    ('What direction', 193),
    ('What can', 216),
    ('What object', 220),
    ('How should', 228),
    ('Which one', 244),
    ('Which way', 352),
    ('Does', 376),
    ('What shape', 385),
    ('Am', 711),
    ('Where', 796),
    ('If', 994),
    ('Are', 1148),
    ('Is there', 1195),
    ('Which direction', 1683),
    ('What color', 1920),
    ('Can', 2508+593),
    ('How many', 4525),
    ('Is the', 5351),
    ('What is', 5942),
    ]
    prefix = [i[0] for i in prefix]

    return prefix

def get_overall_ans_dist():
    dqas = [
        bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read()),
        bson.decode_all(open('./data/data_qa_gec_balanced.bson', 'rb').read()),
        bson.decode_all(open('./data/data_qa_gec_balanced_new.bson', 'rb').read())
    ]
    ans_dists = []
    import json
    all_ans = list(json.load(open('./answer_dict.json', 'r'))[0].keys())
    for dqa in dqas:
        ans_dist = {}
        for i in dqa:
            q = i['question']
            a = i['answer']
            if a not in all_ans:
                continue
            if a in ans_dist:
                ans_dist[a] += 1
            else:
                ans_dist[a] = 1
        assert len(all_ans) == len(ans_dist)
        ans_dist = {k:v/len(dqa) for k, v in ans_dist.items()}
        ans_dists.append(ans_dist)
    return ans_dists

def get_ans_dist():
        ############ balance
    dqas = [
        bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read()),
        bson.decode_all(open('./data/data_qa_gec_balanced.bson', 'rb').read()),
        bson.decode_all(open('./data/data_qa_gec_balanced_new.bson', 'rb').read())
    ]
    # prefix = [
    # ('Which is', 125),
    # ('Do', 127),
    # ('What type', 133),
    # ('How do', 133),
    # ('Which side', 143),
    # ('Which object', 147),
    # ('What direction', 193),
    # ('What can', 216),
    # ('What object', 220),
    # ('How should', 228),
    # ('Which one', 244),
    # ('Which way', 352),
    # ('Does', 376),
    # ('What shape', 385),
    # ('Am', 711),
    # ('Where', 796),
    # ('If', 994),
    # ('Are', 1148),
    # ('Is there', 1195),
    # ('Which direction', 1683),
    # ('What color', 1920),
    # ('Can', 2508+593),
    # ('How many', 4525),
    # ('Is the', 5351),
    # ('What is', 5942),
    # ]
    # prefix = [i[0] for i in prefix]

    dist = []
    for dqa in dqas:
        prefix = get_prefix(dqa)
        count = 0
        import re
        prefix_a = {i:[] for i in prefix}
        for i in dqa:
            q = i['question']
            a = i['answer']
            for p in prefix:
                if re.findall(r'^{}\b'.format(p), q):
                    prefix_a[p].append(a)
                    break
        prefix_data = {}
        for p, alist in prefix_a.items():
            cnt = len(alist)
            count += cnt
            a_d = {}
            for a in alist:
                if a in a_d:
                    a_d[a] += 1
                else:
                    a_d[a] = 1
            a_d = [(k, v/cnt) for k, v in a_d.items()]
            a_d.sort(key=lambda x: x[1], reverse=True)
            prefix_data[p] = a_d
        print('Total: {}, now: {}'.format(len(dqa), count))
    dist.append(prefix_data)
    return dist

def get_prefix_from_q(q):
    import re
    # prefix = [
    # ('Which is', 125),
    # ('Do', 127),
    # ('What type', 133),
    # ('How do', 133),
    # ('Which side', 143),
    # ('Which object', 147),
    # ('What direction', 193),
    # ('What can', 216),
    # ('What object', 220),
    # ('How should', 228),
    # ('Which one', 244),
    # ('Which way', 352),
    # ('Does', 376),
    # ('What shape', 385),
    # ('Am', 711),
    # ('Where', 796),
    # ('If', 994),
    # ('Are', 1148),
    # ('Is there', 1195),
    # ('Which direction', 1683),
    # ('What color', 1920),
    # ('Can', 2508+593),
    # ('How many', 4525),
    # ('Is the', 5351),
    # ('What is', 5942),
    # ]
    prefix = get_prefix(bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read()))
    for p in prefix:
        if re.findall(r'^{}\b'.format(p[0]), q):
            return p[0]
    else:
        return None

def simple_random_guess(split='original'):
    import json
    import numpy as np
    import bson
    import tqdm
    mapping = json.load(open(f'./answer_dict.json'))
    weight = json.load(open(f'./answer_weight_{split}.json'))
    topk = list(mapping[0].keys())
    weight['other'] = 1 - sum(weight.values())
    ordered_weight = {}
    for k in mapping[0].keys():
        ordered_weight[k] = weight[k]
    ordered_weight['other'] = weight['other']
    weight = list(ordered_weight.items())
    for a, b in zip(weight[:-1], mapping[0].keys()):
        assert a[0] == b
    assert weight[-1][0] == 'other'

    guess = lambda: np.random.choice(a=np.arange(len(topk)+1), p=[w[1] for w in weight], size=1)[0]

    dqas = {
        'original': bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read()),
        'balanced': bson.decode_all(open('./data/data_qa_gec_balanced.bson', 'rb').read()),
        'balanced_new': bson.decode_all(open('./data/data_qa_gec_balanced_new.bson', 'rb').read())
    }
    dqa = dqas[split]
    corr = 0
    for i in tqdm.tqdm(dqa):
        gta = i['answer'] if i['answer'] in topk else 'other'
        g = guess()
        ga = mapping[1][str(g)] if g != 706 else 'other'
        if ga == gta:
            corr += 1
    print('Acc: {:.4f}'.format(corr/len(dqa)))

def prefix_random_guess(split='original'):
    import json
    import numpy as np
    import bson
    import tqdm
    mapping = json.load(open(f'./answer_dict.json'))
    weight = json.load(open(f'./answer_weight_{split}.json'))
    topk = list(mapping[0].keys())
    weight['other'] = 1 - sum(weight.values())
    ordered_weight = {}
    for k in mapping[0].keys():
        ordered_weight[k] = weight[k]
    ordered_weight['other'] = weight['other']
    weight = list(ordered_weight.items())
    for a, b in zip(weight[:-1], mapping[0].keys()):
        assert a[0] == b
    assert weight[-1][0] == 'other'

    dqas = {
        'original': bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read()),
        'balanced': bson.decode_all(open('./data/data_qa_gec_balanced.bson', 'rb').read()),
        'balanced_new': bson.decode_all(open('./data/data_qa_gec_balanced_new.bson', 'rb').read())
    }
    dqa = dqas[split]

    import re
    prefix = get_prefix(1)
    prefix_data = {p:{a:0 for a in topk+['other']} for p in prefix}
    for d in dqa:
        ans = d['answer'] if d['answer'] in topk else 'other'
        for p in prefix:
            if re.findall(r'^{}\b'.format(p), d['question']):
                prefix_data[p][ans] += 1
    prefix_weight = {p:{a:0 for a in topk+['other']} for p in prefix}
    for p, d in prefix_data.items():
        total = sum(d.values())
        for k, v in d.items():
            prefix_weight[p][k] = prefix_data[p][k]/total

        ordered_weight = {}
        for k in mapping[0].keys():
            ordered_weight[k] = prefix_weight[p][k]
        ordered_weight['other'] = prefix_weight[p]['other']
        prefix_weight[p] = list(ordered_weight.items())

    def guess(q, prefix, topk, prefix_weight):
        for p in prefix:
            if re.findall(r'^{}\b'.format(p), q):
                return np.random.choice(a=np.arange(len(topk)+1), p=[w[1] for w in prefix_weight[p]], size=1)[0]
        else:
            return np.random.choice(a=np.arange(len(topk)+1), p=[w[1] for w in weight], size=1)[0]

    corr = 0
    for i in tqdm.tqdm(dqa):
        gta = i['answer'] if i['answer'] in topk else 'other'
        g = guess(i['question'], prefix, topk, prefix_weight)
        ga = mapping[1][str(g)] if g != 706 else 'other'
        if ga == gta:
            corr += 1
    print('Acc: {:.4f}'.format(corr/len(dqa)))

def n_gram_guess(split='full', ngram=3, ratio=0.0):
    import json
    import numpy as np
    import tqdm
    import scipy
    import re
    mapping = json.load(open('./answer_dict.json', 'r'))[0]

    q_file = json.load(open('release_checked/sqa_task/{}/v1_{}_questions_train_scannetv2.json'.format(split, split), 'r'))
    a_file = json.load(open('release_checked/sqa_task/{}/v1_{}_sqa_annotations_train_scannetv2.json'.format(split, split), 'r'))

    # augment question
    base = 1234500000
    new_q = []
    new_a = []
    for i in range(int(len(q_file['questions'])*ratio)):
        import copy
        tmp = copy.deepcopy(q_file['questions'][i])
        tmp['question_id'] += 1234500000
        new_q.append(tmp)
        import random
        s = random.sample(q_file['questions'], k=1)[0]['situation']
        new_a.append({'situation': s, 'question_id': tmp['question_id'], 'answers': [{'answer': 'other'}]})
    print(len(new_q))
    q_file['questions'].extend(new_q)
    a_file['annotations'].extend(new_a)

    qid_to_index = {}
    for i in range(len(a_file['annotations'][:])):
        qid_to_index[a_file['annotations'][i]['question_id']] = i

    dqa = q_file['questions'][:]
    answer_list = list(mapping.keys()) + ['other']
    vocab = {}
    vocab_answer = {}
    dqa_ngrams = []
    for d in tqdm.tqdm(dqa):
        ngrams = []
        #################
        # text = ' '.join([d['situation'], d['question']])
        text = d['question']
        #################
        ans = a_file['annotations'][qid_to_index[d['question_id']]]['answers'][0]['answer']
        text = text.lower().replace(',', '').replace('.', '').replace('?', '').replace('\'s', ' \'s')
        ws = text.split(' ')
        if len(ws) <= ngram:
            k = ' '.join(ws)
            if not k in vocab:
                vocab[k] = 1
                vocab_answer[k] = [ans]
            else:
                vocab[k] = vocab[k] + 1
                vocab_answer[k].append(ans)
            ngrams.append(k)
        else:
            for i in range(len(ws)-ngram+1):
                k = ' '.join(ws[i:i+ngram])
                if not k in vocab:
                    vocab[k] = 1
                    vocab_answer[k] = [ans]
                else:
                    vocab[k] = vocab[k] + 1
                    vocab_answer[k].append(ans)
                ngrams.append(k)
        dqa_ngrams.append(ngrams)
    vocab_weight = {k: v/len(dqa) for k, v in vocab.items()}
    vocab_answer_dist = {k: {a: 0 for a in answer_list} for k in vocab.keys()}
    for k, v in vocab_answer.items():
        total = 0
        for ans in v:
            if ans in answer_list:
                vocab_answer_dist[k][ans] += 1
            else:
                vocab_answer_dist[k]['other'] += 1
        vocab_answer_dist[k] = {i: j/len(v) for i, j in vocab_answer_dist[k].items()}
        import pytest
        assert sum(vocab_answer_dist[k].values()) == pytest.approx(1.0)

    q_file_val = json.load(open('release_checked/sqa_task/{}/v1_{}_questions_val_scannetv2.json'.format(split, split), 'r'))
    a_file_val = json.load(open('release_checked/sqa_task/{}/v1_{}_sqa_annotations_val_scannetv2.json'.format(split, split), 'r'))
    qid_to_index_val = {}
    for i in range(len(a_file_val['annotations'])):
        qid_to_index_val[a_file_val['annotations'][i]['question_id']] = i
    dqa_val = q_file_val['questions']
    dqa_val_ngrams = []
    for d in tqdm.tqdm(dqa_val):
        ngrams = []
        #################
        text = ' '.join([d['situation'], d['question']])
        # text = d['question']
        #################
        text = text.lower().replace(',', '').replace('.', '').replace('?', '').replace('\'s', ' \'s')
        ws = text.split(' ')
        if len(ws) <= ngram:
            k = ' '.join(ws)
            if k in vocab:
                ngrams.append(k)
        else:
            for i in range(len(ws)-ngram+1):
                k = ' '.join(ws[i:i+ngram])
                if k in vocab:
                    ngrams.append(k)
        dqa_val_ngrams.append(ngrams)

    def guess(ngrams, vocab_weight, vocab_answer_dist):
        can = []
        for k in ngrams:
            # tactic 1: sampling
            # can.append(np.random.choice(a=answer_list, p=[w for w in vocab_answer_dist[k].values()], size=1)[0])

            # tactic 2: argmax (result: slightly better than tactic 1)
            can.append(answer_list[np.argmax(list(vocab_answer_dist[k].values()))])
        import scipy.stats as st
        try:
            best_guess = st.mode(can)[0][0]
        except:
            best_guess = 'other'
            # from IPython import embed; embed()
        return best_guess

    # corr = 0
    # for i, ngrams in tqdm.tqdm(zip(dqa, dqa_ngrams)):
    #     ans = a_file['annotations'][qid_to_index[i['question_id']]]['answers'][0]['answer']
    #     gta = ans if ans in answer_list[:-1] else 'other'
    #     ga = guess(ngrams, vocab_weight, vocab_answer_dist)
    #     if ga == gta:
    #         corr += 1
    # print('Train acc: {:.4f}'.format(corr/len(dqa)))

    corr = 0
    for i, ngrams in tqdm.tqdm(zip(dqa_val, dqa_val_ngrams)):
        ans = a_file_val['annotations'][qid_to_index_val[i['question_id']]]['answers'][0]['answer']
        gta = ans if ans in answer_list[:-1] else 'other'

        # # tactic 1: all ngrams
        ngrams_vote = ngrams
        # tactic 2: only the most popular (result: significantly lower than tactic 1)
        # if len(ngrams):
        #     weights = [vocab_weight[g] for g in ngrams]
        #     ngrams_vote = [ngrams[np.argmax(weights)]]
        # else:
        #     ngrams_vote = ngrams

        ga = guess(ngrams_vote, vocab_weight, vocab_answer_dist)
        if ga == gta:
            corr += 1
    print('Val acc: {:.4f}'.format(corr/len(dqa_val)))


if __name__ == '__main__':
    # assume all the bson data locates at ./data and we have ./scene_split.json

    # (optional) merge situations and alternative situations
    merge_alt_situations()

    # gec via regex and gector
    gec_step1()
    gec_step2()
    from IPython import embed; embed()
    gec_step3()

    # generating answer dictionary (topk answers)
    save_answer_dict()

    # dataset balancing
    prefix = get_prefix_answer_dist()
    from pprint import pprint
    pprint(prefix)
    print('Please edit this, then call balance_answer(prefix)')
    from IPython import embed; embed()

    # create dataset split
    create_split(True)