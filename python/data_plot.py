import bson
import numpy as np
import matplotlib.pyplot as plt


def plot_answer_dist(prefix, data, tag):
    ########### answer dist vs. Q prefix
    ret_dqa = data

    answer = []
    for i in ret_dqa:
        answer.append(i['answer'])

    # index = list(range(len(set(answer))))
    # import random
    # random.shuffle(index)
    index = np.load('./data/index.npy')

    answer = list(set(answer))
    answer = {a: ind for a, ind in zip(answer, index)}

    from matplotlib import cm
    rainbow = cm.get_cmap('rainbow', len(answer))

    import re
    prefix_a = {i:[] for i in prefix}
    for i in ret_dqa:
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

    fig, ax = plt.subplots()
    max_floor = 549
    cum_height = {ind:0 for ind in range(len(prefix))}
    for i in range(max_floor):
        x_pos = []
        text = []
        height = []
        for pos, p in enumerate(prefix):
            if len(prefix_data[p]) < i+1:
                continue
            else:
                a, ratio = prefix_data[p][i]
                x_pos.append(pos)
                text.append(a)
                height.append(ratio)
        bars = ax.bar(x_pos, height, bottom=[cum_height[pos] for pos in x_pos], color=[rainbow(answer[a]) for a in text])

        bar_labels = []
        for pos, h, a in zip(x_pos, height, text):
            cum_height[pos] += h
            if h >= 0.03/12:
                bar_labels.append(' '.join(a.split()[:2]))
            else:
                bar_labels.append('')

        text_labels = ax.bar_label(bars, labels=bar_labels, label_type='center')
        for t, h in zip(text_labels, height):
            fontsize = min(12, 12*h/0.03)
            if fontsize < 0.1:
                fontsize = 0
            t.set_fontsize(fontsize)

    ax.set_xticks(np.arange(len(prefix)), prefix)
    fig.set_size_inches(35.5, 10.5)
    plt.savefig(f'/home/robot/{tag}.png')
    ########### answer dist vs. Q prefix

def main():
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

    data = bson.decode_all(open('./data/data_qa_gec.bson', 'rb').read())
    plot_answer_dist(prefix, data, 'original')

    data = bson.decode_all(open('./data/data_qa_gec_balanced.bson', 'rb').read())
    plot_answer_dist(prefix, data, 'balanced')

    data = bson.decode_all(open('./data/data_qa_gec_balanced_new.bson', 'rb').read())
    plot_answer_dist(prefix, data, 'balanced_new')

if __name__ == '__main__':
    main()