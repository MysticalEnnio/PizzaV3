#Pizza

Priority:
6 Always getting first in queue

Every time someone in the queue is passed the queuePower gets decreased by this formula:

When the queuePower is 1 or lower then places cant be passed

queuePower = (Priority-1\*2)+1 or Priority
queuePowerToPass = Priority/2

| Priority | queuePower | queuePowerToPass |
| -------- | ---------- | ---------------- |
| 1        | 1          | 0.5              |
| 2        | 3          | 1                |
| 3        | 5          | 1.5              |
| 4        | 7          | 2                |
| 5        | 9          | 2.5              |

or

queuePower = 2^x^1.1

| Priority | queuePower | queuePowerToPass |
| -------- | ---------- | ---------------- |
| 1        | 1.5        | 1                |
| 2        | 3.5        | 2                |
| 3        | 4          | 4                |
| 4        | 8          | 8                |
| 5        | 16         | 16               |
